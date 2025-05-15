
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

// Dados simulados para o dashboard
const mockData = {
  stats: {
    uploaded: 18,
    converted: 12,
    signed: 8,
    pending: 3,
  },
  recentDocuments: [
    {
      id: "doc-1",
      name: "Contrato de Prestação de Serviços.pdf",
      type: "pdf",
      status: "signed",
      date: "2023-05-13T10:30:00Z",
    },
    {
      id: "doc-2",
      name: "Proposta Comercial.docx",
      type: "docx",
      status: "converted",
      date: "2023-05-12T14:22:00Z",
    },
    {
      id: "doc-3",
      name: "Relatorio_Anual.xlsx",
      type: "xlsx",
      status: "uploaded",
      date: "2023-05-11T09:15:00Z",
    },
    {
      id: "doc-4",
      name: "Procuracao.pdf",
      type: "pdf",
      status: "pending",
      date: "2023-05-10T16:45:00Z",
    },
  ],
};

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

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, recentDocuments } = mockData;

  // Cálculo do limite de uso para o plano gratuito
  const freeLimit = 5;
  const usagePct = user?.plan === 'free' ? Math.min(100, (stats.uploaded / freeLimit) * 100) : 0;

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name}! Gerencie seus documentos aqui.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/converter">
              <Button variant="outline" className="flex gap-2">
                <Download size={16} />
                <span>Converter</span>
              </Button>
            </Link>
            <Link to="/sign">
              <Button className="flex gap-2">
                <Edit size={16} />
                <span>Assinar Documentos</span>
              </Button>
            </Link>
          </div>
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
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <DocIcon type={doc.type} />
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-[280px]">
                          {doc.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={doc.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
                  <div className="doc-card">
                    <div className="p-2 bg-primary/10 rounded-md w-fit">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Converter</h3>
                    <p className="text-sm text-muted-foreground">
                      PDF ⬄ Word, Excel, Imagem
                    </p>
                  </div>
                </Link>
                
                <Link to="/sign">
                  <div className="doc-card">
                    <div className="p-2 bg-primary/10 rounded-md w-fit">
                      <Edit className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Assinar</h3>
                    <p className="text-sm text-muted-foreground">
                      Assinar documentos
                    </p>
                  </div>
                </Link>
                
                <Link to="/merge">
                  <div className="doc-card">
                    <div className="p-2 bg-primary/10 rounded-md w-fit">
                      <Files className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Juntar PDFs</h3>
                    <p className="text-sm text-muted-foreground">
                      Combinar vários PDFs
                    </p>
                  </div>
                </Link>
                
                <Link to="/cert-manager">
                  <div className="doc-card">
                    <div className="p-2 bg-primary/10 rounded-md w-fit">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Certificados</h3>
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
                  <div className="flex items-center">
                    <div className="h-60 w-full flex items-center justify-center">
                      <BarChart className="h-24 w-24 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground ml-4">
                        Estatísticas detalhadas disponíveis no MVP completo
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="conversions" className="flex items-center justify-center h-[250px]">
                  <div className="flex items-center">
                    <BarChart className="h-24 w-24 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground ml-4">
                      Estatísticas detalhadas disponíveis no MVP completo
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="signatures" className="flex items-center justify-center h-[250px]">
                  <div className="flex items-center">
                    <BarChart className="h-24 w-24 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground ml-4">
                      Estatísticas detalhadas disponíveis no MVP completo
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
