
import React from "react";
import { useDropzone } from "react-dropzone";
import { Files, Shield } from "lucide-react";
import { FileWithPreview } from "@/types/file";

interface DropZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isPremium: boolean;
}

export function DropZone({ onDrop, isPremium }: DropZoneProps) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDrop,
  });

  return (
    <div {...getRootProps({ className: 'dropzone' })} className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors">
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Files className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Arraste arquivos PDF ou clique aqui</h3>
        <p className="text-muted-foreground mt-2">
          Selecione todos os arquivos PDF que deseja combinar
        </p>
        {!isPremium && (
          <div className="mt-4 text-sm text-amber-500 font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Recurso disponível apenas para usuários Premium
          </div>
        )}
      </div>
    </div>
  );
}
