
import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Trash2, FileText } from "lucide-react";

interface PdfFilePreviewProps {
  file: FileWithPreview;
  onRemove: () => void;
}

export function PdfFilePreview({ file, onRemove }: PdfFilePreviewProps) {
  return (
    <div className="mt-4 p-4 border rounded-md bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-muted p-2 rounded">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
