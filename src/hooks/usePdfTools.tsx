
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

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
      const fileId = uuidv4();
      
      // First, upload the file to Supabase Storage
      // Check if the pdf-operations bucket exists, create if not
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('pdf-operations');
        
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('pdf-operations', { public: true });
      }

      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('pdf-operations')
        .upload(`original/${user.id}/${fileId}-${file.name}`, file);

      if (uploadError) {
        throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
      }

      // Get a public URL for the uploaded file
      const { data: publicUrlData } = supabase
        .storage
        .from('pdf-operations')
        .getPublicUrl(`original/${user.id}/${fileId}-${file.name}`);

      // Call the edge function with the file URL
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          operation,
          fileUrl: publicUrlData.publicUrl,
          fileId,
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
            // For split, handle multiple downloads
            data.outputUrls.forEach((url: string, i: number) => {
              setTimeout(() => {
                const parte = i + 1;
                toast({
                  title: `Baixando parte ${parte}`,
                  description: `Iniciando download da parte ${parte}...`,
                });
                
                // Create a link to download the file
                const link = document.createElement('a');
                link.href = url;
                link.download = `parte${parte}_${file.name}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }, i * 1000);
            });
          } else if (data.outputUrl) {
            // For normal operations, handle a single download
            toast({
              title: "Download iniciado",
              description: "Seu arquivo está sendo baixado...",
            });
            
            // Create a link to download the file
            const link = document.createElement('a');
            link.href = data.outputUrl;
            link.download = `${operation}_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }, 500);

        // Record the operation
        const { error: recordError } = await supabase
          .from('pdf_operations')
          .insert({
            user_id: user.id,
            operation: operation,
            file_name: file.name,
            status: 'completed',
            output_url: data.outputUrl || (data.outputUrls ? data.outputUrls[0] : null)
          });
          
        if (recordError) {
          console.error("Error recording PDF operation:", recordError);
        }

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

  // Cleanup function
  const cleanup = useCallback(() => {
    resetFile();
  }, [resetFile]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    file,
    onDrop,
    isProcessing,
    processPdf,
    resetFile,
    cleanup
  };
};
