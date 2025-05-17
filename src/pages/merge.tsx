
import React, { useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { File, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { FilesActionButton } from "@/components/pdf-merge/FilesActionButton";

interface FileWithId {
  id: string;
  file: File;
}

export default function PDFMerge() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [outputName, setOutputName] = useState("merged-file.pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Verify if all files are PDFs
    const allPdfs = acceptedFiles.every(file => file.type === "application/pdf");
    
    if (!allPdfs) {
      toast({
        title: "Erro ao adicionar arquivos",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      });
      return;
    }
    
    // Add new files to the list
    setFiles(prevFiles => {
      // Create a new array with both existing files and new ones
      const updatedFiles = [...prevFiles, ...acceptedFiles.map(file => ({
        id: uuidv4(),
        file,
      }))];
      
      return updatedFiles;
    });
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Erro ao juntar arquivos",
        description: "Selecione pelo menos dois arquivos para juntar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // We need to dynamically import pdfMake to handle browser-specific loading
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      
      // Need to import vfs_fonts separately
      const vfsFontsModule = await import('pdfmake/build/vfs_fonts');
      
      // Use the module's default export
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      
      // Set up fonts
      if (vfsFontsModule.default && vfsFontsModule.default.pdfMake) {
        pdfMake.vfs = vfsFontsModule.default.pdfMake.vfs;
      }

      const pdfDocs = await Promise.all(
        files.map(async (fileObj) => {
          const file = fileObj.file;
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (!event.target?.result) {
                reject(new Error("Erro ao ler o arquivo."));
                return;
              }
              const result = event.target.result as string;
              resolve(result);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const docDefinition = {
        content: pdfDocs.map((pdfData) => ({
          image: pdfData,
          width: 500,
        })),
      };

      // Use download method directly
      pdfMake.createPdf(docDefinition).download(outputName);
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Erro ao juntar PDFs:", error);
      toast({
        title: "Erro ao juntar PDFs",
        description: "Ocorreu um erro ao processar os arquivos. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Juntar PDFs</h1>
        <p className="text-muted-foreground mb-4">
          Selecione os arquivos PDF que você deseja juntar.
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-4 mb-4 cursor-pointer ${
            isDragActive ? "border-primary" : "border-border"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-muted-foreground">
            Arraste e solte os arquivos aqui, ou clique para selecionar
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Arquivos selecionados:</h2>
            <ul>
              {files.map((fileObj) => (
                <li key={fileObj.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    {fileObj.file.name}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(fileObj.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Nome do arquivo de saída"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
          />
        </div>

        <FilesActionButton 
          onMerge={handleMerge} 
          isProcessing={isProcessing} 
          disabled={files.length < 2} 
        />
      </div>
    </Layout>
  );
}
