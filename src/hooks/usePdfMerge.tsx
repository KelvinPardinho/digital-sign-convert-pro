
import { useState } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ensureBucketExists, recordConversion } from "@/utils/supabaseStorage";
import { downloadFile } from "@/utils/fileDownload";
import { v4 as uuidv4 } from 'uuid';

// PDF file type validator
const isPdfFile = (file: File) => file.type === "application/pdf";

export function usePdfMerge() {
  const { toast } = useToast();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the new useFileUpload hook
  const { 
    files, 
    setFiles,
    onDrop: handleFileDrop, 
    resetFiles,
    removeFile 
  } = useFileUpload(isPdfFile);
  
  // PDF merging is now available for all users
  const isPremium = true;

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

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, movedFile);
    
    setFiles(newFiles);
  };

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
    
    // Verify authentication
    if (!user) {
      toast({
        variant: "destructive",
        title: "Autenticação necessária",
        description: "Por favor, faça login para juntar PDFs."
      });
      navigate("/login");
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
      
      // Ensure storage bucket exists
      const bucketExists = await ensureBucketExists('pdf-operations');
      if (!bucketExists) {
        throw new Error("Erro ao verificar bucket de armazenamento");
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
      
      // Record the operation in conversions table
      await recordConversion(
        user?.id || '',
        'multiple-files.pdf',
        'pdf',
        'pdf',
        data.outputUrl
      );
      
      toast({
        title: "PDFs unidos com sucesso",
        description: `${files.length} arquivos foram combinados em um único PDF.`
      });
      
      // Download the merged file
      setTimeout(() => {
        downloadFile(
          data.outputUrl,
          `documentos-unidos-${Date.now()}.pdf`
        );

        toast({
          title: "Download iniciado",
          description: "Seu arquivo combinado está sendo baixado..."
        });
      }, 500);
      
      // Clean up files after successful merge
      resetFiles();
      
    } catch (error: any) {
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
