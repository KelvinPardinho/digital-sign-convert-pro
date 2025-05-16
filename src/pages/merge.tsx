
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { FileWithPreview } from "@/types/file";
import { useAuth } from "@/providers/AuthProvider";
import { ChevronUp, ChevronDown, Trash2, Files, FileText, Download, GripVertical, Shield } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MergePDF() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDrop: (acceptedFiles) => {
      // Check if user is premium for this feature
      if (user?.plan !== "premium") {
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
    }
  });

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
  React.useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Juntar PDFs</h1>
            <p className="text-muted-foreground">
              Combine vários arquivos PDF em um único documento
            </p>
          </div>
          
          {user?.plan !== 'premium' && (
            <div className="bg-muted px-4 py-2 rounded-md mt-4 md:mt-0 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Recurso disponível apenas para usuários Premium</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-7 gap-6">
          {/* Left side - Upload area and file list */}
          <div className="md:col-span-4 space-y-6">
            {/* Upload area */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione os PDFs para unir</CardTitle>
              </CardHeader>
              <CardContent>
                <div {...getRootProps({ className: 'dropzone' })} className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center text-center">
                    <Files className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Arraste arquivos PDF ou clique aqui</h3>
                    <p className="text-muted-foreground mt-2">
                      Selecione todos os arquivos PDF que deseja combinar
                    </p>
                    {user?.plan !== 'premium' && (
                      <div className="mt-4 text-sm text-amber-500 font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Recurso disponível apenas para usuários Premium
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File list - only show if there are files */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Arquivos selecionados ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="pdf-list">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {files.map((file, index) => (
                            <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 bg-muted/50 p-3 rounded-md"
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-shrink-0">
                                    <FileText className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="truncate font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => moveFileUp(index)}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => moveFileDown(index)}
                                      disabled={index === files.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeFile(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <Button
                        className="w-full"
                        disabled={isProcessing || files.length < 2}
                        onClick={handleMerge}
                      >
                        {isProcessing ? (
                          "Processando..."
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Juntar PDFs e Baixar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right side - Instructions */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Como funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Selecione os arquivos</h3>
                    <p className="text-muted-foreground text-sm">
                      Arraste ou clique para selecionar os arquivos PDF que deseja combinar
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Organize a ordem</h3>
                    <p className="text-muted-foreground text-sm">
                      Arraste os arquivos para reorganizar a ordem em que aparecerão no PDF final
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Clique em "Juntar PDFs e Baixar"</h3>
                    <p className="text-muted-foreground text-sm">
                      Processamos seus arquivos e disponibilizamos o PDF combinado para download
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-md mt-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Seus arquivos estão seguros
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Todos os arquivos são processados no seu próprio navegador e não são enviados para servidores externos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
