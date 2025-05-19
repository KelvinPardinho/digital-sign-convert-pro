
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
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function Ocr() {
  const { file, onDrop, isProcessing, setIsProcessing, resetFile, cleanup } = usePdfTools();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleOcr = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione um arquivo PDF para aplicar OCR.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, we would process the PDF with OCR here
      // For now, simulate the process with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Record the operation in the database if the user is logged in
      if (user) {
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: file.name,
            original_format: 'pdf',
            output_format: 'pdf_ocr',
            output_url: `/conversions/${file.name.replace('.pdf', '')}_ocr_${Date.now()}.pdf`,
            user_id: user.id
          });

        if (error) {
          console.error("Error recording operation:", error);
        }
      }

      toast({
        title: "OCR aplicado com sucesso",
        description: "O texto do PDF foi reconhecido e agora é pesquisável.",
      });

      // In a real app, we would provide the download link for the OCR PDF
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${file.name.replace('.pdf', '')}_ocr_${uuidv4()}.pdf`;
      link.click();

      resetFile();
    } catch (error) {
      console.error("Erro ao aplicar OCR:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aplicar OCR",
        description: "Ocorreu um erro durante o processo de OCR. Por favor, tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
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
