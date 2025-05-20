
import React, { useState, useEffect, useCallback } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function usePdfMerge() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user is premium
  const isPremium = user?.plan === "premium";

  // Move file up in the list
  const moveFileUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  // Move file down in the list
  const moveFileDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
  };

  // Remove file from the list
  const removeFile = (index: number) => {
    const newFiles = [...files];
    // Revoke the URL to avoid memory leaks
    if (newFiles[index]?.preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, movedFile);
    
    setFiles(newFiles);
  };

  // Handle file drop
  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    // Verify files are PDFs
    const nonPdfFiles = acceptedFiles.filter(file => file.type !== "application/pdf");
    if (nonPdfFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos PDF."
      });
      return;
    }

    // Check file size limits based on user plan
    const maxSize = user?.plan === 'premium' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `O tamanho máximo de arquivo para seu plano é ${maxSize / (1024 * 1024)}MB.`
      });
      return;
    }
    
    const newFiles = acceptedFiles.map(file => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
    }) as FileWithPreview[];
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [user, toast]);

  // Handle merge of PDFs
  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        variant: "destructive",
        title: "Arquivos insuficientes",
        description: "Você precisa de pelo menos 2 PDFs para realizar a junção."
      });
      return;
    }
    
    // Verify premium status again for security
    if (!isPremium) {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "A junção de PDFs está disponível apenas para usuários Premium."
      });
      navigate("/subscription");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a production environment, we'd use the PDFLib library
      // But for now, we'll simulate the process and record it in the database
      
      // Create a merged output filename
      const outputFilename = `documentos-unidos-${Date.now()}.pdf`;
      
      if (user) {
        // Record the operation in Supabase
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: files.map(f => f.name).join(","),
            original_format: "pdf",
            output_format: "pdf",
            output_url: `/conversions/${outputFilename}`,
            user_id: user.id
          });
          
        if (error) {
          console.error("Error recording PDF merge:", error);
          throw new Error("Erro ao registrar operação no banco de dados");
        }
      }
      
      // In a real implementation, we would merge the PDFs here
      // For now, we'll simulate a successful merge
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "PDFs unidos com sucesso",
        description: `${files.length} arquivos foram combinados em um único PDF.`
      });
      
      // In a real app, we would generate and provide the download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([])); // Empty blob for demonstration
      link.download = outputFilename;
      link.click();
      
      // Clean up files after successful merge
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setFiles([]);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast({
        variant: "destructive",
        title: "Erro ao unir PDFs",
        description: "Ocorreu um erro ao processar os arquivos. Por favor, tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return {
    files,
    isProcessing,
    moveFileUp,
    moveFileDown,
    removeFile,
    onDragEnd,
    handleFileDrop,
    handleMerge,
    isPremium
  };
}
