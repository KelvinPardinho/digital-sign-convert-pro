
import { useState, useCallback } from 'react';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from 'react-dropzone';
import { ArrowDown, File, FileText, Download, Upload, X, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FileWithPreview extends File {
  preview?: string;
}

export default function Sign() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [signing, setSigning] = useState(false);
  const [signMethod, setSignMethod] = useState<string>("icp");
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [certPassword, setCertPassword] = useState("");
  const [selectedCertType, setSelectedCertType] = useState("a1");
  const [signaturePosition, setSignaturePosition] = useState("last-page");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (user?.plan === 'free' && files.length + acceptedFiles.length > 3) {
      toast({
        variant: "destructive",
        title: "Limite do plano gratuito",
        description: "Você atingiu o limite de 3 documentos para assinatura. Faça upgrade para o plano premium.",
      });
      return;
    }
    
    // Verificando se são apenas PDFs
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast({
        variant: "destructive",
        title: "Formato não suportado",
        description: "Por favor, selecione apenas arquivos PDF para assinatura.",
      });
      return;
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...pdfFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, [files.length, toast, user?.plan]);

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

  const handleSign = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um documento para assinatura.",
      });
      return;
    }

    if (signMethod === "icp") {
      setShowCertDialog(true);
    } else {
      startSigningProcess();
    }
  };

  const startSigningProcess = () => {
    setSigning(true);
    
    // Simulação de assinatura
    setTimeout(() => {
      setSigning(false);
      toast({
        title: "Assinatura concluída",
        description: `${files.length} documento(s) assinado(s) com sucesso!`,
      });
    }, 2000);
  };

  const closeCertDialog = () => {
    setShowCertDialog(false);
    setCertPassword("");
  };

  const handleCertSubmit = () => {
    if (!certPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Senha necessária",
        description: "Por favor, insira a senha do seu certificado digital.",
      });
      return;
    }
    
    closeCertDialog();
    startSigningProcess();
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Assinatura de Documentos</h1>
            <p className="text-muted-foreground">
              Assine seus documentos com validade jurídica
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/converter">
              <Button variant="outline" className="flex gap-2">
                <Download size={16} />
                <span>Converter</span>
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" className="flex gap-2">
                <FileText size={16} />
                <span>Histórico</span>
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="sign-doc" className="mb-8">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="sign-doc">Assinar Documento</TabsTrigger>
            <TabsTrigger value="request-sign">Solicitar Assinaturas</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-doc" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Assine seus documentos</CardTitle>
                <CardDescription>
                  Assine documentos PDF com certificado digital ou outros métodos de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Método de assinatura</h3>
                    <RadioGroup 
                      defaultValue="icp"
                      value={signMethod} 
                      onValueChange={setSignMethod}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="icp" id="icp" />
                        <Label htmlFor="icp" className="flex flex-col">
                          <span className="font-medium">Certificado ICP-Brasil</span>
                          <span className="text-sm text-muted-foreground">Validade jurídica plena</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="gov" id="gov" />
                        <Label htmlFor="gov" className="flex flex-col">
                          <span className="font-medium">Gov.br</span>
                          <span className="text-sm text-muted-foreground">Assinatura Gov.br</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="simple" id="simple" />
                        <Label htmlFor="simple" className="flex flex-col">
                          <span className="font-medium">Assinatura Eletrônica</span>
                          <span className="text-sm text-muted-foreground">Email + Biometria facial</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Posição da assinatura</h3>
                    <RadioGroup 
                      defaultValue="last-page"
                      value={signaturePosition} 
                      onValueChange={setSignaturePosition}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="last-page" id="last-page" />
                        <Label htmlFor="last-page" className="flex flex-col">
                          <span className="font-medium">Última página</span>
                          <span className="text-sm text-muted-foreground">Canto inferior direito</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="all-pages" id="all-pages" />
                        <Label htmlFor="all-pages" className="flex flex-col">
                          <span className="font-medium">Todas as páginas</span>
                          <span className="text-sm text-muted-foreground">Rodapé de cada página</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="flex flex-col">
                          <span className="font-medium">Personalizado</span>
                          <span className="text-sm text-muted-foreground">Escolher ao visualizar</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Arquivos para assinatura</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Arraste ou selecione os documentos PDF que deseja assinar
                    </p>
                    
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
                          Formatos aceitos: PDF (.pdf)
                        </p>
                        {user?.plan === 'free' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Plano gratuito: {files.length}/3 documentos
                          </p>
                        )}
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Documentos selecionados</h3>
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
                            onClick={handleSign} 
                            disabled={signing}
                            className="gap-2"
                          >
                            {signing ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                <span>Assinando...</span>
                              </>
                            ) : (
                              <>
                                <File className="h-4 w-4" />
                                <span>Assinar documentos</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request-sign" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar assinaturas</CardTitle>
                <CardDescription>
                  Envie documentos para outras pessoas assinarem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Send className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Envie documentos para assinatura</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Carregue documentos e envie para outras pessoas assinarem. Você receberá uma notificação quando o processo for concluído.
                  </p>
                  <div className="flex gap-2">
                    {user?.plan === 'free' ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg">
                          <AlertCircle className="h-5 w-5" />
                          <span>Recurso disponível apenas no plano Premium</span>
                        </div>
                        <Link to="/subscription">
                          <Button variant="default">
                            Fazer upgrade
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Iniciar solicitação</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para certificado digital */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificado Digital</DialogTitle>
            <DialogDescription>
              Selecione o tipo de certificado digital e insira sua senha para continuar com a assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de certificado</Label>
              <RadioGroup 
                defaultValue="a1" 
                value={selectedCertType} 
                onValueChange={setSelectedCertType}
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-4 flex-1">
                  <RadioGroupItem value="a1" id="a1" />
                  <Label htmlFor="a1" className="flex flex-col">
                    <span className="font-medium">Certificado A1</span>
                    <span className="text-sm text-muted-foreground">Arquivo .pfx</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4 flex-1">
                  <RadioGroupItem value="a3" id="a3" />
                  <Label htmlFor="a3" className="flex flex-col">
                    <span className="font-medium">Certificado A3</span>
                    <span className="text-sm text-muted-foreground">Token/Cartão</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4 flex-1">
                  <RadioGroupItem value="cloud" id="cloud" />
                  <Label htmlFor="cloud" className="flex flex-col">
                    <span className="font-medium">Nuvem</span>
                    <span className="text-sm text-muted-foreground">Certificado em nuvem</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {selectedCertType === "a1" && (
              <div className="space-y-2">
                <Label htmlFor="certFile">Arquivo do certificado</Label>
                <Input id="certFile" type="file" accept=".pfx,.p12" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="certPassword">Senha do certificado</Label>
              <Input 
                id="certPassword" 
                type="password" 
                value={certPassword}
                onChange={(e) => setCertPassword(e.target.value)}
                placeholder="Digite a senha do seu certificado"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCertDialog}>Cancelar</Button>
            <Button onClick={handleCertSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
