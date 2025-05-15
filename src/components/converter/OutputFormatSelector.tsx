
import { Button } from "@/components/ui/button";

interface OutputFormatSelectorProps {
  outputFormat: string;
  setOutputFormat: (format: string) => void;
}

export function OutputFormatSelector({ outputFormat, setOutputFormat }: OutputFormatSelectorProps) {
  return (
    <div className="mt-6">
      <h3 className="font-medium mb-2">Selecione o formato de saída</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={outputFormat === "docx" ? "default" : "outline"} 
          onClick={() => setOutputFormat("docx")}
        >
          Word (.docx)
        </Button>
        <Button
          variant={outputFormat === "xlsx" ? "default" : "outline"}
          onClick={() => setOutputFormat("xlsx")}
        >
          Excel (.xlsx)
        </Button>
        <Button
          variant={outputFormat === "jpg" ? "default" : "outline"}
          onClick={() => setOutputFormat("jpg")}
        >
          Imagem (.jpg)
        </Button>
      </div>
    </div>
  );
}
