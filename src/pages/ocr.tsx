
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePdfTools } from "@/hooks/usePdfTools";
import { PdfFileUploadArea } from "@/components/pdf-tools/PdfFileUploadArea";
import { PdfFilePreview } from "@/components/pdf-tools/PdfFilePreview";
import { ProcessControls } from "@/components/pdf-tools/ProcessControls";
import { FileText } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function Ocr() {
  const { file, onDrop, isProcessing, processPdf, resetFile, cleanup } = usePdfTools();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleOcr = async () => {
    // Check authentication
    if (!user) {
      toast({
        variant: "destructive",
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
      });
      return;
    }

    // Process the PDF with OCR operation
    await processPdf('ocr');
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">OCR PDF</h1>
        <p className="text-muted-foreground mb-6">
          Reconheça texto em documentos escaneados e torne seu PDF pesquisável.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Aplicar OCR ao PDF</CardTitle>
            <CardDescription>
              Selecione um arquivo PDF para reconhecer o texto e torná-lo pesquisável
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
                
                <ProcessControls
                  onProcess={handleOcr}
                  isProcessing={isProcessing}
                  actionLabel="Aplicar OCR"
                  processingLabel="Processando OCR..."
                  actionIcon={<FileText className="h-4 w-4" />}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
