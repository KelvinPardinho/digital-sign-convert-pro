
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PlanCard } from "./PlanCard";

interface PlansSectionProps {
  billingPeriod: "monthly" | "annual";
  isLoading: boolean;
  checkingStatus: boolean;
  onSubscribe: (plan: "free" | "premium") => Promise<void>;
  onManageSubscription: () => Promise<void>;
}

export function PlansSection({ 
  billingPeriod, 
  isLoading, 
  checkingStatus,
  onSubscribe,
  onManageSubscription
}: PlansSectionProps) {
  const { user } = useAuth();
  
  // Define free plan features
  const freePlanFeatures = [
    { text: "5 conversões por mês", included: true },
    { text: "Tamanho máximo: 5MB", included: true },
    { text: "Formatos básicos suportados", included: true },
    { text: "Sem assinatura digital", included: false },
    { text: "Sem junção de PDFs", included: false },
  ];
  
  // Define premium plan features
  const premiumPlanFeatures = [
    { text: "Conversões ilimitadas", included: true },
    { text: "Tamanho máximo: 50MB", included: true },
    { text: "Todos os formatos suportados", included: true },
    { text: "Assinatura digital ilimitada", included: true },
    { text: "Junção de PDFs ilimitada", included: true },
  ];
  
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      {/* Free Plan Card */}
      <PlanCard
        title="Plano Gratuito"
        description="Para uso pessoal básico"
        price="R$0"
        period="mês"
        features={freePlanFeatures}
        isCurrentPlan={user?.plan === "free"}
        onSelect={() => onSubscribe("free")}
        buttonText={user?.plan === "free" ? "Plano Atual" : "Selecionar"}
        disabled={user?.plan === "free"}
      />
      
      {/* Premium Plan Card */}
      <PlanCard
        title="Plano Premium"
        description="Para profissionais e empresas"
        price={billingPeriod === "monthly" ? "R$19,90" : "R$199,00"}
        period={billingPeriod === "monthly" ? "mês" : "ano"}
        features={premiumPlanFeatures}
        isCurrentPlan={user?.plan === "premium"}
        recommended={true}
        savingsInfo={billingPeriod === "annual" ? "Economize 16% em relação ao plano mensal" : undefined}
        onSelect={user?.plan === "premium" ? onManageSubscription : () => onSubscribe("premium")}
        isLoading={isLoading || checkingStatus}
        buttonText={user?.plan === "premium" ? "Gerenciar Assinatura" : user ? "Assinar Agora" : "Login para Assinar"}
        disabled={isLoading || checkingStatus}
      />
    </div>
  );
}
