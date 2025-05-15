
import { useState, useCallback } from 'react';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from 'react-dropzone';
import { ArrowDown, Edit, FileText, Lock, Mail, Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

interface FileWithPreview extends File {
  preview?: string;
}

export default function Sign() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [emailsToSign, setEmailsToSign] = useState<string[]>(['']);
  const [signing, setSigning] = useState(false);
  const [certificateType, setCertificateType] = useState<'a1' | 'a3' | 'cloud'>('cloud');
  const [password, setPassword] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (user?.plan === 'free' && files.length + acceptedFiles.length > 3) {
      toast({
        variant: "destructive",
        title: "Limite do plano gratuito",
        description: "Você atingiu o limite de 3 arquivos. Faça upgrade para o plano premium.",
      });
      return;
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.filter(file => file.type === 'application/pdf').map(file => Object.assign(file, {
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

  const handleAddEmailField = () => {
    setEmailsToSign([...emailsToSign, '']);
  };

  const handleRemoveEmailField = (index: number) => {
    const newEmails = [...emailsToSign];
    newEmails.splice(index, 1);
    setEmailsToSign(newEmails);
  };

  const updateEmailField = (index: number, value: string) => {
    const newEmails = [...emailsToSign];
    newEmails[index] = value;
    setEmailsToSign(newEmails);
  };

  const handleSign = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um arquivo para assinar.",
      });
      return;
    }

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

  const handleSendForSigning = () => {
    const validEmails = emailsToSign.filter(email => email.trim() !== '');
    
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um arquivo para enviar.",
      });
      return;
    }
    
    if (validEmails.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum email informado",
        description: "Por favor, adicione pelo menos um email para enviar o documento.",
      });
      return;
    }

    setSigning(true);
    
    // Simulação de envio
    setTimeout(() => {
      setSigning(false);
      toast({
        title: "Documentos enviados",
        description: `${files.length} documento(s) enviado(s) para ${validEmails.length} destinatário(s).`,
      });
    }, 2000);
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Assinatura Digital</h1>
            <p className="text-muted-foreground">
              Assine documentos com certificado digital ou solicite assinaturas de terceiros
            </p>
          </div>
        </div>

        <Tabs defaultValue="sign" className="mb-8">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="sign">Assinar Documentos</TabsTrigger>
            <TabsTrigger value="request">Solicitar Assinaturas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Assinar documentos com seu certificado</CardTitle>
                <CardDescription>
                  Utilize seu certificado digital A1 ou A3 para assinar documentos PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      Formato aceito: PDF (.pdf)
                    </p>
                    {user?.plan === 'free' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plano gratuito: {files.length}/3 arquivos
                      </p>
                    )}
                  </div>
                </div>

                {files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Documentos para assinar</h3>
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
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Certificado Digital</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant={certificateType === 'a1' ? 'default' : 'outline'} 
                      className="justify-start" 
                      onClick={() => setCertificateType('a1')}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {certificateType === 'a1' ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                        </div>
                        <div className="text-left">
                          <div>Certificado A1</div>
                          <div className="text-xs text-muted-foreground">Arquivo .pfx</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant={certificateType === 'a3' ? 'default' : 'outline'} 
                      className="justify-start" 
                      onClick={() => setCertificateType('a3')}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {certificateType === 'a3' ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                        </div>
                        <div className="text-left">
                          <div>Certificado A3</div>
                          <div className="text-xs text-muted-foreground">Token/Cartão</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant={certificateType === 'cloud' ? 'default' : 'outline'} 
                      className="justify-start" 
                      onClick={() => setCertificateType('cloud')}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {certificateType === 'cloud' ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                        </div>
                        <div className="text-left">
                          <div>Certificado em Nuvem</div>
                          <div className="text-xs text-muted-foreground">Assinatura na nuvem</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {certificateType === 'a1' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="certFile">Arquivo do Certificado</Label>
                      <Input id="certFile" type="file" accept=".pfx" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="certPassword">Senha do Certificado</Label>
                      <Input 
                        id="certPassword" 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="mt-1" 
                      />
                    </div>
                  </div>
                )}

                {certificateType === 'a3' && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte seu token ou cartão ao computador e informe a senha quando solicitado.
                    </p>
                  </div>
                )}

                {certificateType === 'cloud' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="certPassword">Senha do Certificado em Nuvem</Label>
                      <Input 
                        id="certPassword" 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSign} 
                  disabled={signing || files.length === 0}
                  className="gap-2"
                >
                  {signing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Assinando...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      <span>Assinar Documentos</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="request" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar assinaturas</CardTitle>
                <CardDescription>
                  Envie documentos para assinatura de outras pessoas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      Formato aceito: PDF (.pdf)
                    </p>
                    {user?.plan === 'free' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plano gratuito: {files.length}/3 arquivos
                      </p>
                    )}
                  </div>
                </div>

                {files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Documentos para enviar</h3>
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
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Destinatários</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Informe os e-mails das pessoas que deverão assinar o(s) documento(s)
                  </p>
                  
                  <div className="space-y-3">
                    {emailsToSign.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <Mail className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="email@exemplo.com"
                              value={email}
                              onChange={(e) => updateEmailField(index, e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        {emailsToSign.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveEmailField(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={handleAddEmailField}
                  >
                    <span>Adicionar e-mail</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 border border-primary/20 bg-primary/5 rounded-lg">
                    <Lock className="h-5 w-5 text-primary mr-3" />
                    <p className="text-sm">
                      {user?.plan === 'free' ? (
                        <span>
                          Plano gratuito: Até 3 assinaturas por mês.{" "}
                          <Link to="/subscription" className="text-primary font-medium">
                            Fazer upgrade
                          </Link>
                        </span>
                      ) : (
                        <span>
                          Assinaturas ilimitadas disponíveis no seu plano Premium.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSendForSigning} 
                  disabled={signing || files.length === 0 || emailsToSign.every(email => email.trim() === '')}
                  className="gap-2"
                >
                  {signing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Enviar para Assinatura</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
