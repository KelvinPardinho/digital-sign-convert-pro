
import React, { useEffect } from "react";
import { Layout } from "@/components/layout";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  
  // Check subscription status and update user
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error("Erro ao verificar assinatura:", error);
          toast({
            variant: "destructive",
            title: "Erro ao verificar assinatura",
            description: "Não foi possível verificar seu status de assinatura."
          });
          return;
        }
        
        // Refresh user data to get updated plan
        if (refreshUser) {
          await refreshUser();
          
          toast({
            title: "Assinatura confirmada!",
            description: "Seu plano Premium foi ativado com sucesso.",
          });
        }
        
      } catch (error) {
        console.error("Erro na verificação da assinatura:", error);
      }
    };
    
    checkSubscription();
  }, [refreshUser, toast]);

  return (
    <Layout>
      <div className="container py-16 max-w-2xl min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold">Assinatura Confirmada!</h1>
          
          <p className="text-xl text-muted-foreground">
            Obrigado por assinar o plano Premium.
          </p>
          
          <p className="mt-2 text-muted-foreground">
            Seu plano Premium já está ativo. Agora você tem acesso a todos os recursos exclusivos.
          </p>
          
          <div className="pt-8 space-y-4">
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => navigate('/dashboard')}
            >
              Ir para o Dashboard
            </Button>
            
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/merge')}
              >
                Experimentar junção de PDFs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
