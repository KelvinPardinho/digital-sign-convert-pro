
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FilesActionButtonProps {
  onMerge: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function FilesActionButton({ onMerge, isProcessing, disabled }: FilesActionButtonProps) {
  return (
    <div className="mt-4">
      <Button
        className="w-full"
        disabled={isProcessing || disabled}
        onClick={onMerge}
      >
        {isProcessing ? (
          "Processando..."
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Juntar PDFs e Baixar
          </>
        )}
      </Button>
    </div>
  );
}
