
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface FilesActionButtonProps {
  onMerge: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function FilesActionButton({ onMerge, isProcessing, disabled }: FilesActionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is premium
  const isPremium = user?.plan === "premium";

  const handleClick = () => {
    // If not logged in, notify user
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para usar esta função.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    // If not premium, redirect to subscription page
    if (!isPremium) {
      toast({
        title: "Recurso Premium",
        description: "A junção de PDFs está disponível apenas para usuários Premium.",
        variant: "default"
      });
      navigate("/subscription");
      return;
    }
    
    // Otherwise, proceed with merge
    onMerge();
  };

  return (
    <div className="mt-4">
      <Button
        className="w-full"
        disabled={isProcessing || disabled}
        onClick={handleClick}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            {isPremium ? "Juntar PDFs e Baixar" : "Upgrade para Premium"}
          </>
        )}
      </Button>
    </div>
  );
}
