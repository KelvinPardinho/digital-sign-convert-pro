
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/components/ui/use-toast";
import { FileWithPreview } from '@/types/file';
import { FileUploadArea } from './FileUploadArea';
import { FileList } from './FileList';
import { ConvertButton } from './ConvertButton';

interface ToPdfTabProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  converting: boolean;
  handleConvert: () => void;
  userPlan?: string;
}

export function ToPdfTab({ files, setFiles, converting, handleConvert, userPlan }: ToPdfTabProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (userPlan === 'free' && files.length + acceptedFiles.length > 5) {
      toast({
        variant: "destructive",
        title: "Limite do plano gratuito",
        description: "Você atingiu o limite de 5 arquivos. Faça upgrade para o plano premium.",
      });
      return;
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, [files.length, toast, userPlan, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const removeFile = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      URL.revokeObjectURL(newFiles[index].preview || '');
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Converter para PDF</CardTitle>
        <CardDescription>
          Converta arquivos Word, Excel e imagens para o formato PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUploadArea 
          onDrop={onDrop}
          isDragActive={isDragActive}
          getInputProps={getInputProps}
          getRootProps={getRootProps}
          plan={userPlan}
          fileCount={files.length}
          formats="Word (.doc, .docx), Excel (.xls, .xlsx), Imagens (.jpg, .png)"
        />

        <FileList files={files} removeFile={removeFile} />

        {files.length > 0 && (
          <ConvertButton 
            onClick={handleConvert} 
            converting={converting} 
            label="Converter para PDF"
          />
        )}
      </CardContent>
    </Card>
  );
}
