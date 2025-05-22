
import React from "react";
import { useDropzone } from "react-dropzone";
import { Files } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DropZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isPremium: boolean;
}

export function DropZone({ onDrop, isPremium }: DropZoneProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrop = (acceptedFiles: File[]) => {
    // If not logged in, notify and redirect
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    // Since merging is now available for all users, we don't need premium check
    // Just proceed with the drop
    onDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDrop: handleDrop,
  });

  return (
    <div 
      {...getRootProps({ className: 'dropzone' })} 
      className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Files className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Arraste arquivos PDF ou clique aqui</h3>
        <p className="text-muted-foreground mt-2">
          Selecione todos os arquivos PDF que deseja combinar
        </p>
      </div>
    </div>
  );
}
