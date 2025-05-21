
import React, { useState, useEffect, useCallback } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function usePdfMerge() {
  const { toast } = useToast();
  const { user, session } = useAuth();
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
    
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      const fileId = uuidv4();
      const uploadPromises = [];
      const fileUrls = [];
      
      // First check if the storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('pdf-operations');
        
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('pdf-operations', { public: true });
      }
      
      // Upload all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `merge-input-${i+1}-${fileId}-${file.name}`;
        
        // Upload the file
        const uploadPromise = supabase
          .storage
          .from('pdf-operations')
          .upload(`original/${user?.id}/${fileName}`, file);
          
        uploadPromises.push(uploadPromise);
      }
      
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Check for upload errors
      const uploadErrors = uploadResults.filter(result => result.error);
      if (uploadErrors.length > 0) {
        throw new Error(`Failed to upload ${uploadErrors.length} files`);
      }
      
      // Get public URLs for all uploaded files
      for (let i = 0; i < files.length; i++) {
        const fileName = `merge-input-${i+1}-${fileId}-${files[i].name}`;
        const { data: publicUrlData } = supabase
          .storage
          .from('pdf-operations')
          .getPublicUrl(`original/${user?.id}/${fileName}`);
          
        fileUrls.push(publicUrlData.publicUrl);
      }
      
      // Call the edge function to merge PDFs
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          operation: 'merge',
          fileUrls: fileUrls,
          fileId,
          fileName: 'merged-document.pdf',
          userId: user?.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.error || "Erro ao mesclar PDFs");
      }
      
      // Record the operation in conversions table instead of pdf_operations
      const { error: recordError } = await supabase
        .from('conversions')
        .insert({
          user_id: user?.id,
          original_filename: 'multiple-files.pdf',
          original_format: 'pdf',
          output_format: 'pdf',
          output_url: data.outputUrl
        });
        
      if (recordError) {
        console.error("Error recording PDF merge:", recordError);
      }
      
      toast({
        title: "PDFs unidos com sucesso",
        description: `${files.length} arquivos foram combinados em um único PDF.`
      });
      
      // Download the merged file
      setTimeout(() => {
        // Create a link to download the file
        const link = document.createElement('a');
        link.href = data.outputUrl;
        link.download = `documentos-unidos-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download iniciado",
          description: "Seu arquivo combinado está sendo baixado..."
        });
      }, 500);
      
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
