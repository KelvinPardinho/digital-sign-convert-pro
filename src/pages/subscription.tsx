import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { CheckCircle, CreditCard, FileText, CheckCheck, Lock, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Subscription() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  // Handle canceled payment
  useEffect(() => {
    const canceled = new URLSearchParams(location.search).get("canceled");
    if (canceled) {
      toast({
        title: "Pagamento cancelado",
        description: "O processo de pagamento foi cancelado. Você pode tentar novamente quando quiser.",
      });
      // Remove the query parameter
      navigate("/subscription", { replace: true });
    }
  }, [location.search, toast, navigate]);

  // Refresh subscription status when component mounts
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        setCheckingStatus(true);
        const { error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error("Error checking subscription:", error);
        } else if (refreshUser) {
          // Refresh user data to get updated plan
          await refreshUser();
        }
      } catch (error) {
        console.error("Error in subscription check:", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    checkSubscription();
  }, [user, refreshUser]);

  // Start Stripe checkout
  const handleSubscribe = async (plan: "free" | "premium") => {
    if (plan === "free" || user?.plan === plan) return;
    
    if (!user) {
      // Redirect to login first
      navigate("/login?redirect=subscription");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: billingPeriod }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle customer portal for subscription management
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Call customer portal edge function
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe customer portal
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        variant: "destructive",
        title: "Erro ao acessar portal",
        description: "Não foi possível acessar o portal de gerenciamento da assinatura. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-muted-foreground mb-8">
          Selecione o plano ideal para você e aproveite todos os recursos
        </p>

        {/* Billing period toggle */}
        <div className="flex justify-center mb-8">
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as "monthly" | "annual")}>
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">Anual (2 meses grátis)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan Card */}
          <Card className={`border-2 ${user?.plan === "free" ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Plano Gratuito
                {user?.plan === "free" && <CheckCircle className="h-5 w-5 text-primary" />}
              </CardTitle>
              <CardDescription>Para uso pessoal básico</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">R$0</span>
                <span className="text-muted-foreground"> / mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>5 conversões por mês</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Tamanho máximo: 5MB</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Formatos básicos suportados</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-5 w-5 mt-0.5" />
                  <span>Sem assinatura digital</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Lock className="h-5 w-5 mt-0.5" />
                  <span>Sem junção de PDFs</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={user?.plan === "free"}>
                {user?.plan === "free" ? "Plano Atual" : "Selecionar"}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan Card */}
          <Card className={`border-2 ${user?.plan === "premium" ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium w-fit mb-2">
                Recomendado
              </div>
              <CardTitle className="flex justify-between items-center">
                Plano Premium
                {user?.plan === "premium" && <CheckCircle className="h-5 w-5 text-primary" />}
              </CardTitle>
              <CardDescription>Para profissionais e empresas</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {billingPeriod === "monthly" ? "R$19,90" : "R$199,00"}
                </span>
                <span className="text-muted-foreground">
                  {" "}/{billingPeriod === "monthly" ? " mês" : " ano"}
                </span>
                {billingPeriod === "annual" && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Economize 16% em relação ao plano mensal
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Conversões ilimitadas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Tamanho máximo: 50MB</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Todos os formatos suportados</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Assinatura digital ilimitada</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
                  <span>Junção de PDFs ilimitada</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user?.plan === "premium" ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={isLoading || checkingStatus}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : "Gerenciar Assinatura"}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe("premium")}
                  disabled={isLoading || checkingStatus}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : user 
                    ? "Assinar Agora" 
                    : "Login para Assinar"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Features comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Comparação de Recursos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Recursos</th>
                  <th className="text-center py-4 px-4">Gratuito</th>
                  <th className="text-center py-4 px-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">Conversões mensais</td>
                  <td className="text-center py-4 px-4">5</td>
                  <td className="text-center py-4 px-4">Ilimitado</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Tamanho máximo do arquivo</td>
                  <td className="text-center py-4 px-4">5MB</td>
                  <td className="text-center py-4 px-4">50MB</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Formatos suportados</td>
                  <td className="text-center py-4 px-4">Básicos</td>
                  <td className="text-center py-4 px-4">Todos</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Assinatura digital</td>
                  <td className="text-center py-4 px-4">Não</td>
                  <td className="text-center py-4 px-4">Sim</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Junção de PDFs</td>
                  <td className="text-center py-4 px-4">Não</td>
                  <td className="text-center py-4 px-4">Sim</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Suporte prioritário</td>
                  <td className="text-center py-4 px-4">Não</td>
                  <td className="text-center py-4 px-4">Sim</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Como posso cancelar minha assinatura?</h3>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento de assinatura. 
                O cancelamento será efetivo no final do período de cobrança atual.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito Visa, Mastercard, American Express para assinaturas mensais e anuais.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">O que acontece se eu exceder o limite do plano gratuito?</h3>
              <p className="text-muted-foreground">
                Quando você atingir o limite de 5 conversões no plano gratuito, será necessário aguardar até o próximo mês 
                ou fazer upgrade para o plano premium para continuar utilizando o serviço.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">O plano premium oferece algum desconto para pagamento anual?</h3>
              <p className="text-muted-foreground">
                Sim! Ao optar pelo pagamento anual, você recebe 2 meses grátis, economizando 16% em relação ao plano mensal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
