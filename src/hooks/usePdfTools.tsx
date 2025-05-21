
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { ensureBucketExists, uploadFileToBucket, recordConversion } from '@/utils/supabaseStorage';
import { downloadFile, downloadMultipleFiles } from '@/utils/fileDownload';

type ProcessOptions = {
  password?: string;
  pageRanges?: string;
};

export const usePdfTools = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();

  // Function to handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // Function to clear the file
  const resetFile = useCallback(() => {
    setFile(null);
  }, []);

  // Function to process PDF with different operations
  const processPdf = async (operation: string, options: ProcessOptions = {}) => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum arquivo selecionado",
      });
      return false;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return false;
    }

    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        });
        return false;
      }
    }

    setIsProcessing(true);

    try {
      // Ensure the PDF operations bucket exists
      const bucketExists = await ensureBucketExists('pdf-operations');
      if (!bucketExists) {
        throw new Error("Erro ao verificar bucket de armazenamento");
      }

      // Upload file to storage
      const uploadResult = await uploadFileToBucket(file, user.id, 'pdf-operations');
      if (!uploadResult) {
        throw new Error("Erro ao enviar arquivo");
      }

      // Call the edge function with the file URL
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          operation,
          fileUrl: uploadResult.publicUrl,
          fileId: uploadResult.fileId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id,
          ...options
        }
      });

      if (error) {
        throw error;
      }

      // Handle the response from the edge function
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message,
        });

        // Handle download of the resulting file(s)
        setTimeout(() => {
          if (operation === 'split' && data.outputUrls && Array.isArray(data.outputUrls)) {
            // For split operation, download multiple files
            toast({
              title: "Baixando arquivos",
              description: `Iniciando download de ${data.outputUrls.length} partes...`,
            });
            
            downloadMultipleFiles(
              data.outputUrls, 
              'parte', 
              `_${file.name}`,
              1000
            );
          } else if (data.outputUrl) {
            // For normal operations, handle a single download
            toast({
              title: "Download iniciado",
              description: "Seu arquivo está sendo baixado...",
            });
            
            downloadFile(data.outputUrl, `${operation}_${file.name}`);
          }
        }, 500);

        // Record the operation in conversions table
        await recordConversion(
          user.id,
          file.name,
          "pdf",
          "pdf",
          data.outputUrl || (data.outputUrls ? data.outputUrls[0] : null)
        );

        return true;
      } else {
        throw new Error("Falha ao processar PDF");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error.message || "Ocorreu um erro inesperado",
      });
      console.error("Erro ao processar PDF:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    file,
    onDrop,
    isProcessing,
    processPdf,
    resetFile
  };
};
