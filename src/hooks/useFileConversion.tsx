
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileWithPreview } from '@/types/file';

export function useFileConversion() {
  const [converting, setConverting] = useState(false);
  const [outputFormat, setOutputFormat] = useState<string>("pdf");
  const { toast } = useToast();

  const handleConvert = (files: FileWithPreview[]) => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um arquivo para converter.",
      });
      return;
    }

    setConverting(true);
    
    // Simulação de conversão
    setTimeout(() => {
      setConverting(false);
      toast({
        title: "Conversão concluída",
        description: `${files.length} arquivo(s) convertido(s) com sucesso!`,
      });
    }, 2000);
  };

  return {
    converting,
    outputFormat,
    setOutputFormat,
    handleConvert
  };
}
