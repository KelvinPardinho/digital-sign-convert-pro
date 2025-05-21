
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';

type ProcessOptions = {
  password?: string;
  pageRanges?: string;
};

export const usePdfTools = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();

  // Função para lidar com o arquivo solto
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // Função para limpar o arquivo
  const resetFile = useCallback(() => {
    setFile(null);
  }, []);

  // Função para processar o PDF com diferentes operações
  const processPdf = async (operation: string, options: ProcessOptions = {}) => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum arquivo selecionado",
      });
      return false;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return false;
    }

    setIsProcessing(true);

    try {
      // Obter uma sessão válida para enviar o token JWT
      if (!session) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Sessão inválida");
        }
      }

      // Prepare the file data (in a real scenario, we would upload it to storage)
      // For this simulation, we're just sending the file name
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type
      };

      // Chamar a função Edge do Supabase com o token JWT no cabeçalho
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: {
          operation,
          files: [fileData],
          ...options
        }
      });

      if (error) {
        throw error;
      }

      // Simular download do arquivo resultante
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message,
        });

        // Simular download - em um cenário real, obteríamos uma URL de download
        setTimeout(() => {
          const link = document.createElement('a');
          if (operation === 'split' && data.outputUrls) {
            // Para split, simular múltiplos downloads
            data.outputUrls.forEach((url: string, i: number) => {
              setTimeout(() => {
                const parte = i + 1;
                toast({
                  title: `Baixando parte ${parte}`,
                  description: `Iniciando download da parte ${parte}...`,
                });
              }, i * 1000);
            });
          } else if (data.outputUrl) {
            // Para operações normais, simular um download
            toast({
              title: "Download iniciado",
              description: "Seu arquivo está sendo baixado...",
            });
          }
        }, 500);

        return true;
      } else {
        throw new Error("Falha ao processar PDF");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error.message || "Ocorreu um erro inesperado",
      });
      console.error("Erro ao processar PDF:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Função de limpeza
  const cleanup = useCallback(() => {
    resetFile();
  }, [resetFile]);

  // Limpar quando o componente for desmontado
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    file,
    onDrop,
    isProcessing,
    processPdf,
    resetFile,
    cleanup
  };
};
