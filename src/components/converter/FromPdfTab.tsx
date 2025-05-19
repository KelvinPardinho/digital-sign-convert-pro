
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/components/ui/use-toast";
import { FileWithPreview } from '@/types/file';
import { FileUploadArea } from './FileUploadArea';
import { FileList } from './FileList';
import { OutputFormatSelector } from './OutputFormatSelector';
import { ConvertButton } from './ConvertButton';

interface FromPdfTabProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  converting: boolean;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  handleConvert: () => void;
  userPlan?: string;
}

export function FromPdfTab({ 
  files, 
  setFiles, 
  converting, 
  outputFormat, 
  setOutputFormat, 
  handleConvert, 
  userPlan 
}: FromPdfTabProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file size limit based on user plan
    const maxSize = userPlan === 'premium' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB or 10MB
    
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const planText = userPlan === 'premium' ? 'Premium (50MB)' : 'Gratuito (10MB)';
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `Alguns arquivos excedem o limite de tamanho do plano ${planText}.`,
      });
      
      // Only add files that are under the size limit
      const validFiles = acceptedFiles.filter(file => file.size <= maxSize);
      if (validFiles.length === 0) return;
      
      setFiles(prevFiles => [
        ...prevFiles,
        ...validFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      ]);
      return;
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, [userPlan, toast, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
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
        <CardTitle>Converter de PDF</CardTitle>
        <CardDescription>
          Converta seus arquivos PDF para Word, Excel ou imagem
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
          formats="PDF (.pdf)"
        />

        <FileList files={files} removeFile={removeFile} />

        {files.length > 0 && (
          <>
            <OutputFormatSelector
              outputFormat={outputFormat}
              setOutputFormat={setOutputFormat}
            />
            <ConvertButton 
              onClick={handleConvert} 
              converting={converting} 
              label="Converter"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
