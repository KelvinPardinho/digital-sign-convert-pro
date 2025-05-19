
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { FileWithPreview } from "@/types/file";

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

    // Add preview to the file
    const fileWithPreview = Object.assign(selectedFile, {
      preview: URL.createObjectURL(selectedFile)
    }) as FileWithPreview;
    
    // Clear previous file if exists
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    
    setFile(fileWithPreview);
  }, [file, maxFileSize, toast, user]);

  const resetFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  };

  // Clean up the preview URL when component unmounts
  const cleanup = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  return {
    file,
    setFile,
    resetFile,
    onDrop,
    isProcessing,
    setIsProcessing,
    cleanup,
    acceptedTypes
  };
}
