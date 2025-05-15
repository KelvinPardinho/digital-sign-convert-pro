
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtém o caminho de redirecionamento, se existir
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // O erro já é tratado dentro da função signIn
      console.error("Erro de login:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função de login simulado (para demonstração)
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    toast({
      description: "Entrando com conta de demonstração...",
    });

    try {
      // Criar um usuário demo caso não exista
      const demoEmail = "demo@convert.com";
      const demoPassword = "demo123";
      const demoName = "Usuário Demo";
      
      const storedUsers = JSON.parse(localStorage.getItem('convertUsers') || '[]');
      if (!storedUsers.some((user: any) => user.email === demoEmail)) {
        const newUser = {
          id: `user-demo`,
          email: demoEmail,
          password: demoPassword,
          name: demoName,
          plan: 'premium',
          avatar: `https://ui-avatars.com/api/?name=Usuario+Demo&background=random`
        };
        localStorage.setItem('convertUsers', JSON.stringify([...storedUsers, newUser]));
      }
      
      await signIn(demoEmail, demoPassword);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Erro ao entrar com conta demo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12 md:py-24">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Convert</span>
          </Link>
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-1">Entre na sua conta para continuar</p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/90"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                ou continue com
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
          >
            Conta de demonstração
          </Button>

          <p className="text-center text-sm mt-6">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
