
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

export default function Protect() {
  const { file, onDrop, isProcessing, processPdf, resetFile, cleanup } = usePdfTools();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

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
    // Check authentication
    if (!user) {
      toast({
        variant: "destructive",
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
      });
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    // Process the PDF with protect operation, including the password
    await processPdf('protect', { password });
    
    // Clear password fields
    setPassword("");
    setConfirmPassword("");
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
