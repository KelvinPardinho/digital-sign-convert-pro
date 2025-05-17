
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BillingPeriodSelectorProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
}

export function BillingPeriodSelector({ value, onChange }: BillingPeriodSelectorProps) {
  return (
    <div className="flex justify-center mb-8">
      <Tabs value={value} onValueChange={(v) => onChange(v as "monthly" | "annual")}>
        <TabsList>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="annual">Anual (2 meses grátis)</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
