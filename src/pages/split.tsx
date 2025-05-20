
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

export default function Split() {
  const { file, onDrop, isProcessing, processPdf, resetFile, cleanup } = usePdfTools();
  const [pageRanges, setPageRanges] = useState("1-3,4-5");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleSplit = async () => {
    // Check authentication
    if (!user) {
      toast({
        variant: "destructive",
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
      });
      return;
    }

    // Validate page ranges format
    const rangePattern = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
    if (!rangePattern.test(pageRanges)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "O formato dos intervalos de página é inválido. Use o formato: 1-3,4,5-7",
      });
      return;
    }

    // Process the PDF with split operation, including the page ranges
    await processPdf('split', { pageRanges });
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
