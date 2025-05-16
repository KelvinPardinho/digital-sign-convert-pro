
import React, { useState, useEffect } from "react";
import { FileWithPreview } from "@/types/file";
import { useToast } from "@/components/ui/use-toast";

export function usePdfMerge() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
    URL.revokeObjectURL(newFiles[index].preview);
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
  const handleFileDrop = (isPremium: boolean) => (acceptedFiles: File[]) => {
    // Check if user is premium for this feature
    if (!isPremium) {
      toast({
        variant: "destructive", 
        title: "Recurso Premium",
        description: "A junção de PDFs está disponível apenas para usuários Premium."
      });
      return;
    }
    
    const newFiles = acceptedFiles.map(file => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
    }) as FileWithPreview[];
    
    setFiles([...files, ...newFiles]);
  };

  // Handle merge of PDFs
  const handleMerge = () => {
    if (files.length < 2) {
      toast({
        variant: "destructive",
        title: "Arquivos insuficientes",
        description: "Você precisa de pelo menos 2 PDFs para realizar a junção."
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "PDFs unidos com sucesso",
        description: `${files.length} arquivos foram combinados em um único PDF.`
      });
      
      // In a real app, we would generate and provide the download link
      // For now, just simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = 'documentos-unidos.pdf';
      link.click();
    }, 2000);
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
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
    handleMerge
  };
}
