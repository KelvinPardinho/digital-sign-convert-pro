
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { FileWithPreview } from '@/types/file';

interface PdfFileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
  acceptedTypes?: Record<string, string[]>;
  file: FileWithPreview | null;
  userPlan?: string;
}

export function PdfFileUploadArea({ 
  onDrop, 
  acceptedTypes = { 'application/pdf': ['.pdf'] },
  file,
  userPlan
}: PdfFileUploadAreaProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: acceptedTypes,
    maxFiles: 1
  });

  const maxFileSize = userPlan === 'premium' ? '50MB' : '10MB';
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        file ? "opacity-50" : ""
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          {file ? "Arraste outro arquivo ou clique para substituir" : "Arraste um arquivo PDF aqui ou clique para selecionar"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tamanho máximo: {maxFileSize}
        </p>
      </div>
    </div>
  );
}
