
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { FileWithPreview } from '@/types/file';

interface FileListProps {
  files: FileWithPreview[];
  removeFile: (index: number) => void;
}

export function FileList({ files, removeFile }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Arquivos selecionados</h3>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div 
            key={`${file.name}-${index}`} 
            className="flex items-center justify-between p-3 border rounded-lg bg-card"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeFile(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
