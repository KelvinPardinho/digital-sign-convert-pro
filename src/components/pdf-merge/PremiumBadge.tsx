
import React from "react";
import { Shield } from "lucide-react";

export function PremiumBadge() {
  return (
    <div className="bg-muted px-4 py-2 rounded-md mt-4 md:mt-0 text-sm flex items-center gap-2">
      <Shield className="h-4 w-4 text-amber-500" />
      <span>Recurso disponível apenas para usuários Premium</span>
    </div>
  );
}
