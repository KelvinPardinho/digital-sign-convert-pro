
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, MoreHorizontal, Calendar, Trash } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

// Type definition for a conversion record
interface Conversion {
  id: string;
  original_filename: string;
  original_format: string;
  output_format: string;
  output_url: string;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, use mock data if Supabase is not connected
  const mockData = [
    {
      id: "1",
      original_filename: "Relatório Anual 2023",
      original_format: "docx",
      output_format: "pdf",
      output_url: "/downloads/relatorio-anual-2023.pdf",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      original_filename: "Contrato de Prestação",
      original_format: "pdf",
      output_format: "docx",
      output_url: "/downloads/contrato-prestacao.docx",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      original_filename: "Foto Perfil",
      original_format: "png",
      output_format: "jpg",
      output_url: "/downloads/foto-perfil.jpg",
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function fetchConversions() {
      setIsLoading(true);
      try {
        // Try to fetch from Supabase if authenticated
        if (user) {
          const { data, error } = await supabase
            .from("conversions")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          if (data && data.length > 0) {
            setConversions(data);
          } else {
            // Use mock data if no conversions found
            setConversions(mockData);
          }
        } else {
          // Use mock data if not authenticated
          setConversions(mockData);
        }
      } catch (error) {
        console.error("Error fetching conversion history:", error);
        // Fallback to mock data
        setConversions(mockData);
        toast({
          variant: "destructive",
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar seu histórico de conversões.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversions();
  }, [user, toast]);

  const handleDownload = (conversion: Conversion) => {
    // In a real implementation, this would download from the actual URL
    toast({
      title: "Download iniciado",
      description: `Baixando ${conversion.original_filename}.${conversion.output_format}`,
    });
    
    // Simulate download for demo purposes
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: `${conversion.original_filename}.${conversion.output_format} foi baixado com sucesso.`,
      });
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from Supabase if connected
      if (user) {
        const { error } = await supabase
          .from("conversions")
          .delete()
          .eq("id", id);

        if (error) throw error;
      }
      
      // Update local state
      setConversions(conversions.filter(conv => conv.id !== id));
      
      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido do histórico.",
      });
    } catch (error) {
      console.error("Error deleting conversion:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível remover o arquivo do histórico.",
      });
    }
  };

  // Format the date to display how long ago it was
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  // Get the appropriate file icon based on format
  const getFormatIcon = (format: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Conversões</h1>
            <p className="text-muted-foreground">
              Visualize suas conversões anteriores
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Suas Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-center">
                  <p className="text-muted-foreground">Carregando histórico...</p>
                </div>
              </div>
            ) : conversions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo Original</TableHead>
                      <TableHead className="hidden md:table-cell">Formato Original</TableHead>
                      <TableHead>Formato Convertido</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversions.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getFormatIcon(conversion.original_format)}
                            <span className="truncate max-w-[150px] md:max-w-[250px]">
                              {conversion.original_filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {conversion.original_format.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {conversion.output_format.toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(conversion.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(conversion)}
                              title="Baixar arquivo"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(conversion)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(conversion.id)} className="text-destructive">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Nenhuma conversão encontrada</h3>
                <p className="text-muted-foreground mt-2">
                  Você ainda não realizou conversões. Visite a página de conversão para começar.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/converter">Converter Arquivos</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
