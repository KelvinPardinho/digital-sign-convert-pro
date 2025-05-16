
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { CheckCircle, CreditCard, FileText, Upload, CheckCheck, Lock } from "lucide-react";

export default function Subscription() {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentTab, setPaymentTab] = useState("credit-card");

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (/^\d*$/.test(value) && value.length <= 16) {
      // Format with spaces after every 4 digits
      setCardNumber(
        value.replace(/(\d{4})/g, "$1 ").trim()
      );
    }
  };

  // Format expiry date with slash
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      if (value.length > 2) {
        setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
      } else {
        setCardExpiry(value);
      }
    }
  };

  // Handle CVC input (numbers only)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCardCvc(value);
    }
  };

  // Simulate payment processing
  const handleSubscribe = async () => {
    if (paymentTab === "credit-card" && (!cardNumber || !cardName || !cardExpiry || !cardCvc)) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos do cartão de crédito.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate payment processing delay
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Assinatura ativada com sucesso!",
        description: "Seu plano Premium está ativo. Aproveite todos os recursos!",
      });
      
      // Simulate upgrading user
      const updatedUser = {
        ...user!,
        plan: "premium" as const
      };
      
      // Save to localStorage for demo
      localStorage.setItem("convertUser", JSON.stringify(updatedUser));
      
      // Redirect to dashboard after successful payment
      window.location.href = "/dashboard";
    }, 2000);
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-muted-foreground mb-8">
          Selecione o plano ideal para você e aproveite todos os recursos
        </p>

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
                <span className="text-3xl font-bold">R$19,90</span>
                <span className="text-muted-foreground"> / mês</span>
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
              <Button 
                className="w-full" 
                disabled={user?.plan === "premium" || isLoading}
                onClick={() => {
                  if (user) {
                    document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/login?redirect=subscription";
                  }
                }}
              >
                {user?.plan === "premium" 
                  ? "Plano Atual" 
                  : user 
                    ? "Assinar Agora" 
                    : "Login para Assinar"}
              </Button>
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

        {/* Payment section - only show if user is logged in and not premium */}
        {user && user.plan !== "premium" && (
          <div id="payment-section" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">Informações de Pagamento</h2>
            
            <Tabs value={paymentTab} onValueChange={setPaymentTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="credit-card">Cartão de Crédito</TabsTrigger>
                <TabsTrigger value="pix">PIX</TabsTrigger>
              </TabsList>
              
              <TabsContent value="credit-card">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pagamento por Cartão
                    </CardTitle>
                    <CardDescription>
                      Digite os dados do seu cartão para completar a assinatura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-number">Número do Cartão</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-name">Nome no Cartão</Label>
                      <Input
                        id="card-name"
                        placeholder="João da Silva"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expiry">Validade</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={handleCvcChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handleSubscribe}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processando..." : "Finalizar Assinatura"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="pix">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-5 w-5 flex items-center justify-center font-bold">P</div>
                      Pagamento por PIX
                    </CardTitle>
                    <CardDescription>
                      Escaneie o QR Code ou copie o código PIX para concluir o pagamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    {/* Fake QR Code */}
                    <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <div className="w-32 h-32 border-2 border-current grid grid-cols-4 grid-rows-4 gap-1 p-2">
                        {/* Simple QR code simulation */}
                        {Array(16).fill(0).map((_, i) => (
                          <div 
                            key={i} 
                            className={`${Math.random() > 0.6 ? "bg-current" : ""} w-full h-full`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md w-full mb-4 text-center">
                      <p className="text-xs break-all select-all">
                        00020126580014br.gov.bcb.pix0136a629534e-7368-4053-9014-0524d79187213
                        5204000053039865802BR5925Convert Docs SA62070503***63042D2D
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mb-4"
                      onClick={() => {
                        navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136a629534e-7368-4053-9014-0524d79187213 5204000053039865802BR5925Convert Docs SA62070503***63042D2D");
                        toast({
                          title: "Código PIX copiado",
                          description: "Cole no seu aplicativo de banco para concluir o pagamento.",
                        });
                      }}
                    >
                      Copiar código PIX
                    </Button>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleSubscribe}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processando..." : "Confirmar Pagamento"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Como posso cancelar minha assinatura?</h3>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através da área de configurações da conta. O cancelamento será efetivo no final do período de cobrança atual.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Quais formas de pagamento são aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito Visa, Mastercard, American Express e pagamento via PIX para assinaturas mensais e anuais.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">O que acontece se eu exceder o limite do plano gratuito?</h3>
              <p className="text-muted-foreground">
                Quando você atingir o limite de 5 conversões no plano gratuito, será necessário aguardar até o próximo mês ou fazer upgrade para o plano premium para continuar utilizando o serviço.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">O plano premium oferece algum desconto para pagamento anual?</h3>
              <p className="text-muted-foreground">
                Sim! Ao optar pelo pagamento anual, você recebe 2 meses grátis, pagando apenas 10 meses pelo uso do serviço durante todo o ano.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
