import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

interface FilesActionButtonProps {
  onMerge: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function FilesActionButton({ onMerge, isProcessing, disabled }: FilesActionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is premium
  const isPremium = user?.plan === "premium";

  const handleClick = () => {
    // If not premium, redirect to subscription page
    if (!isPremium) {
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
          "Processando..."
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
