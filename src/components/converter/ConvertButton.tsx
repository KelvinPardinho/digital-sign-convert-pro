
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface ConvertButtonProps {
  onClick: () => void;
  converting: boolean;
  label?: string;
}

export function ConvertButton({ 
  onClick, 
  converting,
  label = "Converter para PDF" 
}: ConvertButtonProps) {
  return (
    <div className="flex justify-end mt-6">
      <Button 
        onClick={onClick} 
        disabled={converting}
        className="gap-2"
      >
        {converting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span>Convertendo...</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4" />
            <span>{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}
