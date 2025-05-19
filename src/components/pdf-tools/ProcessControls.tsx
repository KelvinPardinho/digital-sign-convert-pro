
import { Button } from "@/components/ui/button";

interface ProcessControlsProps {
  onProcess: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  actionLabel: string;
  processingLabel: string;
  actionIcon?: React.ReactNode;
}

export function ProcessControls({ 
  onProcess, 
  isProcessing, 
  disabled = false,
  actionLabel,
  processingLabel,
  actionIcon
}: ProcessControlsProps) {
  return (
    <div className="flex justify-end mt-6">
      <Button 
        onClick={onProcess} 
        disabled={disabled || isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span>{processingLabel}</span>
          </>
        ) : (
          <>
            {actionIcon}
            <span>{actionLabel}</span>
          </>
        )}
      </Button>
    </div>
  );
}
