
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  BarChart,
  FileText,
  Upload,
  Edit,
  Clock,
  ArrowRight,
  Download,
  Lock,
  Files,
} from "lucide-react";
import { UserCard } from "@/components/dashboard/UserCard";
import { supabase } from "@/integrations/supabase/client";
import { getUserConversions } from "@/utils/supabaseStorage";

// Type definitions for the dashboard data
interface Conversion {
  id: string;
  original_filename: string;
  original_format: string;
  output_format: string;
  output_url: string | null;
  created_at: string;
  status: string;
}

interface DashboardStats {
  uploaded: number;
  converted: number;
  signed: number;
  pending: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    uploaded: 0,
    converted: 0,
    signed: 0,
    pending: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Get user's conversions
        const conversions = await getUserConversions(user.id);
        
        // Calculate stats from real data
        const uploadedCount = conversions.length;
        const convertedCount = conversions.filter(c => c.output_url).length;
        
        // For now, signing and pending are placeholders since we don't have that functionality yet
        // In a real app, these would come from their respective tables
        
        setStats({
          uploaded: uploadedCount,
          converted: convertedCount,
          signed: 0, // Would come from a real signatures table
          pending: 0, // Would come from a real pending_operations table
        });
        
        // Process conversions to match the format needed for display
        const processedDocs = conversions.slice(0, 4).map(conv => ({
          id: conv.id,
          original_filename: conv.original_filename,
          original_format: conv.original_format,
          output_format: conv.output_format,
          output_url: conv.output_url,
          created_at: conv.created_at,
          status: conv.output_url ? "converted" : "uploaded",
          type: conv.original_format.toLowerCase(),
        }));
        
        setRecentDocuments(processedDocs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Funções para formatar datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Componente para renderizar o ícone de cada tipo de documento
  const DocIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-primary" />;
      case "docx":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "xlsx":
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Componente para renderizar o status de cada documento
  const StatusBadge = ({ status }: { status: string }) => {
    let classes = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    let icon = null;
    let text = "";

    switch (status) {
      case "signed":
        classes += " bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
        icon = <Edit className="mr-1 h-3 w-3" />;
        text = "Assinado";
        break;
      case "converted":
        classes += " bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
        icon = <Download className="mr-1 h-3 w-3" />;
        text = "Convertido";
        break;
      case "uploaded":
        classes += " bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400";
        icon = <Upload className="mr-1 h-3 w-3" />;
        text = "Enviado";
        break;
      case "pending":
        classes += " bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
        icon = <Clock className="mr-1 h-3 w-3" />;
        text = "Pendente";
        break;
      default:
        classes += " bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400";
    }

    return (
      <span className={classes}>
        {icon}
        {text}
      </span>
    );
  };

  // Cálculo do limite de uso para o plano gratuito
  const freeLimit = 5;
  const usagePct = user?.plan === 'free' ? Math.min(100, (stats.uploaded / freeLimit) * 100) : 0;

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <div className="grid gap-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <UserCard />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documentos Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.uploaded}</div>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documentos Convertidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.converted}</div>
                  <Download className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documentos Assinados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.signed}</div>
                  <Edit className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assinaturas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {user?.plan === 'free' && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Limite de Uso</CardTitle>
                <CardDescription>
                  Você utilizou {stats.uploaded} de {freeLimit} documentos no plano gratuito.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={usagePct} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {stats.uploaded}/{freeLimit} documentos
                    </span>
                    <Link to="/subscription">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Lock size={14} />
                        <span>Atualizar para Premium</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Recentes</CardTitle>
                <CardDescription>
                  Seus documentos dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-center">
                      <p className="text-muted-foreground">Carregando histórico...</p>
                    </div>
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            <DocIcon type={doc.type} />
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-[280px]">
                              {doc.original_filename}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusBadge status={doc.status} />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(doc.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (doc.output_url) {
                              window.open(doc.output_url, '_blank');
                            }
                          }}
                          disabled={!doc.output_url}
                          title={doc.output_url ? "Baixar arquivo" : "Arquivo não disponível"}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">
                      Nenhum documento encontrado. Comece convertendo ou enviando arquivos.
                    </p>
                  </div>
                )}
                <div className="mt-6 text-center">
                  <Link to="/history">
                    <Button variant="outline">
                      Ver todos os documentos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Funções mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/converter">
                    <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-md w-fit">
                        <Download className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium mt-2">Converter</h3>
                      <p className="text-sm text-muted-foreground">
                        PDF ⬄ Word, Excel, Imagem
                      </p>
                    </div>
                  </Link>
                  
                  <Link to="/sign">
                    <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-md w-fit">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium mt-2">Assinar</h3>
                      <p className="text-sm text-muted-foreground">
                        Assinar documentos
                      </p>
                    </div>
                  </Link>
                  
                  <Link to="/merge">
                    <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-md w-fit">
                        <Files className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium mt-2">Juntar PDFs</h3>
                      <p className="text-sm text-muted-foreground">
                        Combinar vários PDFs
                      </p>
                    </div>
                  </Link>
                  
                  <Link to="/cert-manager">
                    <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-md w-fit">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium mt-2">Certificados</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerenciar certificados
                      </p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Atividade</CardTitle>
                <CardDescription>
                  Estatísticas de uso nas últimas semanas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="uploads" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="uploads">Envios</TabsTrigger>
                    <TabsTrigger value="conversions">Conversões</TabsTrigger>
                    <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="uploads" className="space-y-4">
                    <div className="flex items-center justify-center h-[250px]">
                      <div className="text-center space-y-2">
                        <BarChart className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          {isLoading ? 
                            "Carregando estatísticas..." : 
                            stats.uploaded > 0 ? 
                              `Você enviou ${stats.uploaded} arquivos` : 
                              "Nenhum arquivo enviado ainda"
                          }
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          asChild
                        >
                          <Link to="/converter">Converter Arquivos</Link>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="conversions" className="flex items-center justify-center h-[250px]">
                    <div className="text-center space-y-2">
                      <BarChart className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {isLoading ? 
                          "Carregando estatísticas..." : 
                          stats.converted > 0 ? 
                            `Você converteu ${stats.converted} arquivos` : 
                            "Nenhuma conversão realizada ainda"
                        }
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        asChild
                      >
                        <Link to="/converter">Converter Arquivos</Link>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="signatures" className="flex items-center justify-center h-[250px]">
                    <div className="text-center space-y-2">
                      <BarChart className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {stats.signed > 0 ? 
                          `Você assinou ${stats.signed} documentos` : 
                          "Nenhuma assinatura realizada ainda"
                        }
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        asChild
                      >
                        <Link to="/sign">Assinar Documentos</Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
