
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
import { Download, FileText, MoreHorizontal, Calendar, Trash, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { getUserConversions } from "@/utils/supabaseStorage";

// Type definition for a conversion record
interface Conversion {
  id: string;
  original_filename: string;
  original_format: string;
  output_format: string;
  output_url: string | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversions() {
      setIsLoading(true);
      try {
        if (user) {
          const data = await getUserConversions(user.id);
          setConversions(data);
        }
      } catch (error) {
        console.error("Error fetching conversion history:", error);
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
    if (!conversion.output_url) {
      toast({
        variant: "destructive",
        title: "Arquivo não disponível",
        description: "O link para download deste arquivo não está disponível.",
      });
      return;
    }
    
    // Open the file URL in a new tab
    window.open(conversion.output_url, '_blank');
    
    toast({
      title: "Download iniciado",
      description: `Baixando ${conversion.original_filename}.${conversion.output_format}`,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeletingId(id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from("conversions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
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
    } finally {
      setIsDeletingId(null);
    }
  };

  // Format the date to display how long ago it was
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return "Data desconhecida";
    }
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
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
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
                              disabled={!conversion.output_url}
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
                                <DropdownMenuItem 
                                  onClick={() => handleDownload(conversion)}
                                  disabled={!conversion.output_url}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(conversion.id)} 
                                  className="text-destructive"
                                  disabled={isDeletingId === conversion.id}
                                >
                                  {isDeletingId === conversion.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Excluindo...
                                    </>
                                  ) : (
                                    <>
                                      <Trash className="h-4 w-4 mr-2" />
                                      Excluir
                                    </>
                                  )}
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
