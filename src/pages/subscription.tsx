
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BillingPeriodSelector } from "@/components/subscription/BillingPeriodSelector";
import { PlansSection } from "@/components/subscription/PlansSection";
import { FeatureComparisonTable } from "@/components/subscription/FeatureComparisonTable";
import { FaqSection } from "@/components/subscription/FaqSection";

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

        <BillingPeriodSelector 
          value={billingPeriod} 
          onChange={(v) => setBillingPeriod(v as "monthly" | "annual")} 
        />

        <PlansSection
          billingPeriod={billingPeriod}
          isLoading={isLoading}
          checkingStatus={checkingStatus}
          onSubscribe={handleSubscribe}
          onManageSubscription={handleManageSubscription}
        />

        <FeatureComparisonTable />
        
        <FaqSection />
      </div>
    </Layout>
  );
}
