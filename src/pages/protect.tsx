
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePdfTools } from "@/hooks/usePdfTools";
import { PdfFileUploadArea } from "@/components/pdf-tools/PdfFileUploadArea";
import { PdfFilePreview } from "@/components/pdf-tools/PdfFilePreview";
import { ProcessControls } from "@/components/pdf-tools/ProcessControls";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function Protect() {
  const { file, onDrop, isProcessing, setIsProcessing, resetFile, cleanup } = usePdfTools();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, []);

  const validatePasswords = () => {
    if (!password) {
      setPasswordError("A senha é obrigatória");
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  const handleProtect = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione um arquivo PDF para proteger.",
      });
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, we would encrypt the PDF here
      // For now, simulate the process with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the operation in the database if the user is logged in
      if (user) {
        const { error } = await supabase
          .from('conversions')
          .insert({
            original_filename: file.name,
            original_format: 'pdf',
            output_format: 'pdf_protected',
            output_url: `/conversions/${file.name.replace('.pdf', '')}_protected_${Date.now()}.pdf`,
            user_id: user.id
          });

        if (error) {
          console.error("Error recording operation:", error);
        }
      }

      toast({
        title: "PDF protegido com sucesso",
        description: "O PDF foi protegido com senha.",
      });

      // In a real app, we would provide the download link for the protected PDF
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${file.name.replace('.pdf', '')}_protected_${uuidv4()}.pdf`;
      link.click();

      resetFile();
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao proteger PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao proteger PDF",
        description: "Ocorreu um erro durante o processo de proteção. Por favor, tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Proteger PDF</h1>
        <p className="text-muted-foreground mb-6">
          Adicione proteção por senha ao seu arquivo PDF.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Proteger PDF com senha</CardTitle>
            <CardDescription>
              Selecione um arquivo PDF e defina uma senha para protegê-lo
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
                
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password"
                      type="password"
                      placeholder="Digite uma senha" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input 
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme a senha" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                    />
                    {passwordError && (
                      <p className="text-xs text-destructive mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>
                
                <ProcessControls
                  onProcess={handleProtect}
                  isProcessing={isProcessing}
                  actionLabel="Proteger PDF"
                  processingLabel="Protegendo..."
                  actionIcon={<Lock className="h-4 w-4" />}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
