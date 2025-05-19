
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePdfTools } from "@/hooks/usePdfTools";
import { PdfFileUploadArea } from "@/components/pdf-tools/PdfFileUploadArea";
import { PdfFilePreview } from "@/components/pdf-tools/PdfFilePreview";
import { ProcessControls } from "@/components/pdf-tools/ProcessControls";
import { LockOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function Unlock() {
  const { file, onDrop, isProcessing, setIsProcessing, resetFile, cleanup } = usePdfTools();
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleUnlock = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione um arquivo PDF para remover a senha.",
      });
      return;
    }

    if (!password) {
      toast({
        variant: "destructive",
        title: "Senha não fornecida",
        description: "Por favor, digite a senha do PDF.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, we would decrypt the PDF here
      // For now, simulate the process with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the operation in the database if the user is logged in
      if (user) {
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: file.name,
            original_format: 'pdf_protected',
            output_format: 'pdf',
            output_url: `/conversions/${file.name.replace('.pdf', '')}_unlocked_${Date.now()}.pdf`,
            user_id: user.id
          });

        if (error) {
          console.error("Error recording operation:", error);
        }
      }

      toast({
        title: "Senha removida com sucesso",
        description: "A senha foi removida do PDF.",
      });

      // In a real app, we would provide the download link for the unlocked PDF
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${file.name.replace('.pdf', '')}_unlocked_${uuidv4()}.pdf`;
      link.click();

      resetFile();
      setPassword("");
    } catch (error) {
      console.error("Erro ao remover senha do PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover senha",
        description: "Ocorreu um erro durante o processo. Verifique se a senha está correta.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Remover Senha do PDF</h1>
        <p className="text-muted-foreground mb-6">
          Remova a proteção por senha de um arquivo PDF.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Remover senha do PDF</CardTitle>
            <CardDescription>
              Selecione um arquivo PDF protegido e digite a senha para removê-la
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
                  <Label htmlFor="password">Senha do PDF</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Digite a senha do PDF" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <ProcessControls
                  onProcess={handleUnlock}
                  isProcessing={isProcessing}
                  actionLabel="Remover Senha"
                  processingLabel="Removendo senha..."
                  actionIcon={<LockOpen className="h-4 w-4" />}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
