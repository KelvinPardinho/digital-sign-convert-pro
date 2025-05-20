
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

export default function Unlock() {
  const { file, onDrop, isProcessing, processPdf, resetFile, cleanup } = usePdfTools();
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleUnlock = async () => {
    // Check authentication
    if (!user) {
      toast({
        variant: "destructive",
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
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

    // Process the PDF with unlock operation, including the password
    const success = await processPdf('unlock', { password });
    
    // Clear password field if successful
    if (success) {
      setPassword("");
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
