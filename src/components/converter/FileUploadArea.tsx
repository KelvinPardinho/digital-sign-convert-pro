
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { FileWithPreview } from '@/types/file';

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive: boolean;
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  plan: string | undefined;
  fileCount: number;
  formats: string;
}

export function FileUploadArea({ 
  onDrop, 
  isDragActive, 
  getInputProps, 
  getRootProps, 
  plan, 
  fileCount, 
  formats 
}: FileUploadAreaProps) {
  const maxFileSize = plan === 'premium' ? '50MB' : '10MB';
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          Arraste arquivos aqui ou clique para selecionar
        </h3>
        <p className="text-sm text-muted-foreground">
          Formatos aceitos: {formats}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tamanho máximo: {maxFileSize}
        </p>
      </div>
    </div>
  );
}
