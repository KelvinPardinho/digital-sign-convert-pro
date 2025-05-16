
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { FileDigit, FilePlus, Key, Shield, Upload, FileCog, FileCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function CertManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("installed");
  const [isUploading, setIsUploading] = useState(false);
  const [password, setPassword] = useState("");

  // Mock certificates data
  const certificates = [
    {
      id: "1",
      name: "Certificado Pessoal",
      issuer: "AC-VALID",
      expires: "2025-12-31",
      type: "A1",
      status: "active",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is premium
    if (user?.plan !== 'premium') {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Apenas usuários premium podem importar certificados digitais.",
      });
      return;
    }

    // Simulate file upload
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Certificado importado",
        description: `${file.name} foi importado com sucesso.`,
      });
    }, 1500);
  };

  const handleGenerateCertificate = () => {
    // Check if user is premium
    if (user?.plan !== 'premium') {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Apenas usuários premium podem gerar certificados digitais.",
      });
      return;
    }

    // Simulate certificate generation
    toast({
      title: "Certificado em processamento",
      description: "Seu novo certificado está sendo gerado. Isso pode levar alguns instantes.",
    });

    setTimeout(() => {
      toast({
        title: "Certificado gerado",
        description: "Seu novo certificado digital foi criado com sucesso.",
      });
      setActiveTab("installed");
    }, 2000);
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Certificados Digitais</h1>
            <p className="text-muted-foreground">
              Gerencie seus certificados para assinar documentos
            </p>
          </div>
          
          {user?.plan !== 'premium' && (
            <div className="bg-muted px-4 py-2 rounded-md mt-4 md:mt-0 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Recurso disponível apenas para usuários Premium</span>
            </div>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="installed">
              <FileDigit className="h-4 w-4 mr-2" />
              Certificados Instalados
            </TabsTrigger>
            <TabsTrigger value="import">
              <FilePlus className="h-4 w-4 mr-2" />
              Importar Certificado
            </TabsTrigger>
            <TabsTrigger value="generate">
              <FileCog className="h-4 w-4 mr-2" />
              Gerar Novo Certificado
            </TabsTrigger>
          </TabsList>
          
          {/* Installed Certificates Tab */}
          <TabsContent value="installed">
            {certificates.length > 0 ? (
              <div className="grid gap-4">
                {certificates.map((cert) => (
                  <Card key={cert.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-500" />
                        {cert.name}
                      </CardTitle>
                      <CardDescription>
                        Emitido por {cert.issuer} • Tipo {cert.type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Validade:</span>
                          <span>{new Date(cert.expires).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-green-500 font-medium">Ativo</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                      <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
                        Remover
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Nenhum Certificado Instalado</CardTitle>
                  <CardDescription>
                    Você ainda não possui certificados digitais instalados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <FileDigit className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-center text-muted-foreground max-w-md">
                    Importe um certificado existente ou gere um novo certificado para assinar documentos digitalmente.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("import")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Certificado
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveTab("generate")}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Gerar Novo
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          {/* Import Certificate Tab */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Importar Certificado Digital</CardTitle>
                <CardDescription>
                  Importe seu certificado digital existente (formatos .pfx ou .p12)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="certificate-file">Arquivo do Certificado</Label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="certificate-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Clique para selecionar</span> ou arraste o arquivo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Arquivo do certificado (.pfx ou .p12)
                          </p>
                        </div>
                        <Input id="certificate-file" type="file" accept=".pfx,.p12" className="hidden" onChange={handleFileChange} disabled={user?.plan !== 'premium' || isUploading} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="certificate-password">Senha do Certificado</Label>
                    <Input
                      id="certificate-password"
                      type="password"
                      placeholder="Senha de proteção do certificado"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={user?.plan !== 'premium' || isUploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta senha é necessária para acessar seu certificado digital.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={user?.plan !== 'premium' || isUploading || !password}
                >
                  {isUploading ? "Importando..." : "Importar Certificado"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Generate Certificate Tab */}
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Certificado</CardTitle>
                <CardDescription>
                  Crie um novo certificado digital para assinar seus documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="cert-name">Nome do Certificado</Label>
                    <Input
                      id="cert-name"
                      placeholder="Ex: Certificado Pessoal"
                      disabled={user?.plan !== 'premium'}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cert-owner">Proprietário</Label>
                    <Input
                      id="cert-owner"
                      placeholder="Seu nome completo"
                      disabled={user?.plan !== 'premium'}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cert-password">Senha de Proteção</Label>
                    <Input
                      id="cert-password"
                      type="password"
                      placeholder="Crie uma senha forte"
                      disabled={user?.plan !== 'premium'}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta senha será usada para proteger seu certificado. Guarde-a em local seguro.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cert-confirm-password">Confirmar Senha</Label>
                    <Input
                      id="cert-confirm-password"
                      type="password"
                      placeholder="Confirme a senha"
                      disabled={user?.plan !== 'premium'}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={user?.plan !== 'premium'}
                  onClick={handleGenerateCertificate}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Gerar Certificado
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
