
import { useState, useCallback, useEffect } from "react";
import { FileWithPreview } from "@/types/file";

export function useFileUpload(fileTypeValidator?: (file: File) => boolean, maxSize?: number) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  
  // Function to handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Apply file type validation if provided
    const validTypeFiles = fileTypeValidator 
      ? acceptedFiles.filter(fileTypeValidator) 
      : acceptedFiles;
      
    if (validTypeFiles.length !== acceptedFiles.length) {
      console.warn("Some files were rejected due to invalid file type");
    }
    
    // Apply size limit if provided
    const validFiles = maxSize 
      ? validTypeFiles.filter(file => file.size <= maxSize)
      : validTypeFiles;
      
    if (validFiles.length !== validTypeFiles.length) {
      console.warn("Some files were rejected due to size limits");
    }
    
    if (validFiles.length === 0) return;
    
    // Add preview URLs to files
    setFiles(prevFiles => [
      ...prevFiles,
      ...validFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, [fileTypeValidator, maxSize]);

  // Function to clear the files
  const resetFiles = useCallback(() => {
    // Revoke object URLs to avoid memory leaks
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  }, [files]);
  
  // Function to remove a specific file
  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);
  
  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return {
    files,
    setFiles,
    onDrop,
    resetFiles,
    removeFile
  };
}
