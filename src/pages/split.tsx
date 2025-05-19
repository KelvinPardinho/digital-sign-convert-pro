
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePdfTools } from "@/hooks/usePdfTools";
import { PdfFileUploadArea } from "@/components/pdf-tools/PdfFileUploadArea";
import { PdfFilePreview } from "@/components/pdf-tools/PdfFilePreview";
import { ProcessControls } from "@/components/pdf-tools/ProcessControls";
import { Split as SplitIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function Split() {
  const { file, onDrop, isProcessing, setIsProcessing, resetFile, cleanup } = usePdfTools();
  const [pageRanges, setPageRanges] = useState("1-3,4-5");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleSplit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione um arquivo PDF para dividir.",
      });
      return;
    }

    setIsProcessing(true);

    // Validate page ranges format
    const rangePattern = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
    if (!rangePattern.test(pageRanges)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "O formato dos intervalos de página é inválido. Use o formato: 1-3,4,5-7",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // In a real implementation, we would process the PDF here
      // For now, simulate the process with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the operation in the database if the user is logged in
      if (user) {
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: file.name,
            original_format: 'pdf',
            output_format: 'pdf',
            output_url: `/conversions/${file.name.replace('.pdf', '')}_split_${Date.now()}.pdf`,
            user_id: user.id
          });

        if (error) {
          console.error("Error recording operation:", error);
        }
      }

      toast({
        title: "PDF dividido com sucesso",
        description: "O PDF foi dividido de acordo com os intervalos especificados.",
      });

      // In a real app, we would provide download links for the split PDFs
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${file.name.replace('.pdf', '')}_split_${uuidv4()}.pdf`;
      link.click();

      resetFile();
    } catch (error) {
      console.error("Erro ao dividir PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao dividir PDF",
        description: "Ocorreu um erro durante o processo de divisão. Por favor, tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Dividir PDF</h1>
        <p className="text-muted-foreground mb-6">
          Divida seu arquivo PDF em múltiplos documentos baseados em intervalos de páginas.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Dividir PDF</CardTitle>
            <CardDescription>
              Selecione um arquivo PDF e especifique os intervalos de páginas para dividir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PdfFileUploadArea 
              onDrop={onDrop}
              file={file}
              userPlan={user?.plan}
            />

            {file && (
              <>
                <PdfFilePreview file={file} onRemove={resetFile} />
                
                <div className="mt-6">
                  <Label htmlFor="page-ranges">Intervalos de Páginas</Label>
                  <Input 
                    id="page-ranges"
                    placeholder="Ex: 1-3,4,5-7" 
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: 1-3,4,5-7 (irá criar um PDF com as páginas 1 a 3, outro com a página 4 e outro com as páginas 5 a 7)
                  </p>
                </div>
                
                <ProcessControls
                  onProcess={handleSplit}
                  isProcessing={isProcessing}
                  actionLabel="Dividir PDF"
                  processingLabel="Dividindo..."
                  actionIcon={<SplitIcon className="h-4 w-4" />}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
