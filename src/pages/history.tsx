
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ArrowRight, Download, Edit, Upload } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data para o histórico de documentos
const documentHistory = [
  {
    id: "doc-001",
    name: "Contrato de Prestação de Serviços.pdf",
    type: "pdf",
    status: "signed",
    date: "2025-05-10T14:30:00Z",
    size: 1240000,
  },
  {
    id: "doc-002",
    name: "Relatório Financeiro Trimestral.xlsx",
    type: "xlsx",
    status: "converted",
    date: "2025-05-08T11:20:00Z",
    size: 856000,
  },
  {
    id: "doc-003",
    name: "Proposta Comercial Cliente ABC.docx",
    type: "docx",
    status: "uploaded",
    date: "2025-05-07T09:45:00Z",
    size: 435000,
  },
  {
    id: "doc-004",
    name: "Procuração.pdf",
    type: "pdf",
    status: "pending",
    date: "2025-05-06T16:12:00Z",
    size: 567000,
  },
  {
    id: "doc-005",
    name: "Contrato de Confidencialidade.pdf",
    type: "pdf",
    status: "signed",
    date: "2025-05-05T10:30:00Z",
    size: 980000,
  },
  {
    id: "doc-006",
    name: "Apresentação para Diretoria.pptx",
    type: "pptx",
    status: "converted",
    date: "2025-05-04T15:40:00Z",
    size: 2540000,
  },
  {
    id: "doc-007",
    name: "Extrato Bancário Abril 2025.pdf",
    type: "pdf",
    status: "uploaded",
    date: "2025-05-03T11:25:00Z",
    size: 324000,
  },
  {
    id: "doc-008",
    name: "Minuta de Contrato Revisada.docx",
    type: "docx",
    status: "converted",
    date: "2025-05-02T14:15:00Z",
    size: 567000,
  },
  {
    id: "doc-009",
    name: "Declaração de Imposto de Renda 2025.pdf",
    type: "pdf",
    status: "signed",
    date: "2025-04-30T09:20:00Z",
    size: 1450000,
  },
  {
    id: "doc-010",
    name: "Comprovante de Residência.jpg",
    type: "jpg",
    status: "converted",
    date: "2025-04-29T16:05:00Z",
    size: 780000,
  },
];

// Função para formatar a data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Função para formatar o tamanho do arquivo
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
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
    case "pptx":
      return <FileText className="h-5 w-5 text-orange-600" />;
    case "jpg":
    case "png":
      return <FileText className="h-5 w-5 text-purple-600" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Componente para o status do documento
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "signed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <Edit className="mr-1 h-3 w-3" />
          Assinado
        </Badge>
      );
    case "converted":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Download className="mr-1 h-3 w-3" />
          Convertido
        </Badge>
      );
    case "uploaded":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          <Upload className="mr-1 h-3 w-3" />
          Enviado
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Calendar className="mr-1 h-3 w-3" />
          Pendente
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          Desconhecido
        </Badge>
      );
  }
};

export default function History() {
  const { user } = useAuth();
  
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Documentos</h1>
            <p className="text-muted-foreground">
              Acompanhe todos os seus documentos enviados, convertidos e assinados
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/converter">
              <Button variant="outline" className="flex gap-2">
                <Download size={16} />
                <span>Converter Novo</span>
              </Button>
            </Link>
            <Link to="/sign">
              <Button className="flex gap-2">
                <Edit size={16} />
                <span>Assinar Documento</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todos os Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do documento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentHistory.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DocIcon type={doc.type} />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(doc.date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
