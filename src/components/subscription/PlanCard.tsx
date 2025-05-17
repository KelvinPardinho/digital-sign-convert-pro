
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCheck, Lock, CheckCircle, Loader2 } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isCurrentPlan: boolean;
  recommended?: boolean;
  savingsInfo?: string;
  onSelect: () => void;
  isLoading?: boolean;
  buttonText: string;
  disabled?: boolean;
}

export function PlanCard({
  title,
  description,
  price,
  period,
  features,
  isCurrentPlan,
  recommended,
  savingsInfo,
  onSelect,
  isLoading,
  buttonText,
  disabled,
}: PlanCardProps) {
  return (
    <Card className={`border-2 ${isCurrentPlan ? "border-primary" : "border-border"}`}>
      <CardHeader>
        {recommended && (
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium w-fit mb-2">
            Recomendado
          </div>
        )}
        <CardTitle className="flex justify-between items-center">
          {title}
          {isCurrentPlan && <CheckCircle className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground"> /{period}</span>
          {savingsInfo && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {savingsInfo}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              {feature.included ? (
                <CheckCheck className="h-5 w-5 text-primary mt-0.5" />
              ) : (
                <Lock className="h-5 w-5 mt-0.5 text-muted-foreground" />
              )}
              <span className={!feature.included ? "text-muted-foreground" : ""}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant={isCurrentPlan ? "outline" : "default"}
          className="w-full"
          onClick={onSelect}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
