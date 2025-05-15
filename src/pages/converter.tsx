
import { useState, useCallback } from 'react';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from 'react-dropzone';
import { ArrowDown, File, FileText, Download, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

interface FileWithPreview extends File {
  preview?: string;
}

export default function Converter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [converting, setConverting] = useState(false);
  const [outputFormat, setOutputFormat] = useState<string>("pdf");
  const [conversionType, setConversionType] = useState<string>("to-pdf");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (user?.plan === 'free' && files.length + acceptedFiles.length > 5) {
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
  }, [files.length, toast, user?.plan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
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

  const handleConvert = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um arquivo para converter.",
      });
      return;
    }

    setConverting(true);
    
    // Simulação de conversão
    setTimeout(() => {
      setConverting(false);
      toast({
        title: "Conversão concluída",
        description: `${files.length} arquivo(s) convertido(s) com sucesso!`,
      });
    }, 2000);
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Conversor de Documentos</h1>
            <p className="text-muted-foreground">
              Converta seus arquivos entre vários formatos com facilidade
            </p>
          </div>
        </div>

        <Tabs defaultValue="to-pdf" className="mb-8" onValueChange={setConversionType}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="to-pdf">Para PDF</TabsTrigger>
            <TabsTrigger value="from-pdf">Do PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="to-pdf" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Converter para PDF</CardTitle>
                <CardDescription>
                  Converta arquivos Word, Excel e imagens para o formato PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      Formatos aceitos: Word (.doc, .docx), Excel (.xls, .xlsx), Imagens (.jpg, .png)
                    </p>
                    {user?.plan === 'free' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plano gratuito: {files.length}/5 arquivos
                      </p>
                    )}
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Arquivos selecionados</h3>
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div 
                          key={`${file.name}-${index}`} 
                          className="flex items-center justify-between p-3 border rounded-lg bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            <div>
                              <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleConvert} 
                        disabled={converting}
                        className="gap-2"
                      >
                        {converting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            <span>Convertendo...</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="h-4 w-4" />
                            <span>Converter para PDF</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="from-pdf" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Converter de PDF</CardTitle>
                <CardDescription>
                  Converta seus arquivos PDF para Word, Excel ou imagem
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      Arraste PDFs aqui ou clique para selecionar
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: PDF (.pdf)
                    </p>
                    {user?.plan === 'free' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plano gratuito: {files.length}/5 arquivos
                      </p>
                    )}
                  </div>
                </div>

                {files.length > 0 && (
                  <>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Arquivos selecionados</h3>
                      <div className="space-y-3">
                        {files.map((file, index) => (
                          <div 
                            key={`${file.name}-${index}`} 
                            className="flex items-center justify-between p-3 border rounded-lg bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-6 w-6 text-primary" />
                              <div>
                                <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Selecione o formato de saída</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant={outputFormat === "docx" ? "default" : "outline"} 
                          onClick={() => setOutputFormat("docx")}
                        >
                          Word (.docx)
                        </Button>
                        <Button
                          variant={outputFormat === "xlsx" ? "default" : "outline"}
                          onClick={() => setOutputFormat("xlsx")}
                        >
                          Excel (.xlsx)
                        </Button>
                        <Button
                          variant={outputFormat === "jpg" ? "default" : "outline"}
                          onClick={() => setOutputFormat("jpg")}
                        >
                          Imagem (.jpg)
                        </Button>
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button 
                          onClick={handleConvert} 
                          disabled={converting}
                          className="gap-2"
                        >
                          {converting ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                              <span>Convertendo...</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-4 w-4" />
                              <span>Converter</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
