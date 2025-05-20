
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { FileWithPreview } from "@/types/file";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function usePdfTools(acceptedTypes = { 'application/pdf': ['.pdf'] }) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const maxFileSize = user?.plan === 'premium' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // Check file size
    if (selectedFile.size > maxFileSize) {
      const planText = user?.plan === 'premium' ? 'Premium (50MB)' : 'Gratuito (10MB)';
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `O arquivo excede o limite de tamanho do plano ${planText}.`,
      });
      return;
    }

    try {
      // Add preview to the file
      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile)
      }) as FileWithPreview;
      
      // Clear previous file if exists
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      setFile(fileWithPreview);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo",
        description: "Não foi possível processar o arquivo selecionado.",
      });
    }
  }, [file, maxFileSize, toast, user]);

  const resetFile = useCallback(() => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  }, [file]);

  // Process PDF with the specified operation
  const processPdf = async (operation: string, additionalData = {}) => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione um arquivo PDF para processar.",
      });
      return false;
    }

    setIsProcessing(true);

    try {
      // In a production environment, we would send the file to a backend service
      // For now, simulate the process with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Record the operation in the database if the user is logged in
      if (user) {
        // Get the file extension (format)
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        
        // Create a unique filename for the output
        const outputFilename = `${file.name.replace('.pdf', '')}_${operation}_${Date.now()}.pdf`;
        
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: file.name,
            original_format: fileExtension,
            output_format: operation === 'ocr' ? 'pdf_ocr' : 
                           operation === 'protect' ? 'pdf_protected' : 
                           operation === 'unlock' ? 'pdf' : 'pdf',
            output_url: `/conversions/${outputFilename}`,
            user_id: user.id
          });

        if (error) {
          console.error(`Error recording ${operation} operation:`, error);
          throw new Error("Erro ao registrar operação no banco de dados");
        }
      }

      // For demonstration purposes, create a virtual download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([])); // Empty blob for demonstration
      link.download = `${file.name.replace('.pdf', '')}_${operation}_${uuidv4()}.pdf`;
      link.click();

      toast({
        title: "Operação concluída com sucesso",
        description: `O PDF foi processado com a operação ${getOperationName(operation)}.`,
      });

      resetFile();
      return true;
    } catch (error) {
      console.error(`Erro ao processar PDF (${operation}):`, error);
      toast({
        variant: "destructive",
        title: `Erro ao processar PDF`,
        description: "Ocorreu um erro durante o processamento. Por favor, tente novamente.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get operation display name
  const getOperationName = (operation: string): string => {
    switch (operation) {
      case 'ocr': return 'OCR';
      case 'unlock': return 'remoção de senha';
      case 'protect': return 'proteção com senha';
      case 'split': return 'divisão';
      default: return operation;
    }
  };

  // Clean up the preview URL when component unmounts
  const cleanup = useCallback(() => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
  }, [file]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    file,
    setFile,
    resetFile,
    onDrop,
    isProcessing,
    setIsProcessing,
    processPdf,
    cleanup,
    acceptedTypes,
    maxFileSize
  };
}
