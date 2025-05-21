
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileWithPreview } from '@/types/file';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

export function useFileConversion() {
  const [converting, setConverting] = useState(false);
  const [outputFormat, setOutputFormat] = useState<string>("pdf");
  const { toast } = useToast();
  const { user, session } = useAuth();

  const handleConvert = async (files: FileWithPreview[]) => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, adicione pelo menos um arquivo para converter.",
      });
      return;
    }

    // Check file size limits based on user plan
    const maxSize = user?.plan === 'premium' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const planText = user?.plan === 'premium' ? 'Premium (50MB)' : 'Gratuito (10MB)';
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `Alguns arquivos excedem o limite de tamanho do plano ${planText}.`,
      });
      return;
    }

    setConverting(true);
    
    try {
      // For each file, we'll upload it to storage and then process it
      const convertedFiles = await Promise.all(files.map(async (file) => {
        try {
          // Get the file extension (format)
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          
          // Create a unique filename for the output file
          const outputFilename = `${file.name.split('.')[0]}_${Date.now()}.${outputFormat}`;
          const fileId = uuidv4();
          
          if (!session) {
            toast({
              variant: "destructive",
              title: "Sessão expirada",
              description: "Por favor, faça login novamente para continuar.",
            });
            return { success: false, message: "Sessão expirada" };
          }

          // First, upload the file to Supabase Storage
          if (user) {
            // Create a bucket if it doesn't exist
            const { data: bucketData, error: bucketError } = await supabase
              .storage
              .getBucket('conversions');
              
            if (bucketError && bucketError.message.includes('does not exist')) {
              // Create the bucket if it doesn't exist
              await supabase.storage.createBucket('conversions', { public: true });
            }

            // Upload the file to storage
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('conversions')
              .upload(`original/${user.id}/${fileId}-${file.name}`, file);

            if (uploadError) {
              console.error("Error uploading file:", uploadError);
              return { success: false, message: "Erro ao enviar arquivo" };
            }

            // Get a public URL for the uploaded file
            const { data: publicUrlData } = supabase
              .storage
              .from('conversions')
              .getPublicUrl(`original/${user.id}/${fileId}-${file.name}`);
            
            // Call the edge function to process the conversion
            const { data, error } = await supabase.functions.invoke('convert-file', {
              body: {
                fileUrl: publicUrlData.publicUrl,
                fileId,
                originalFilename: file.name,
                originalFormat: fileExtension,
                outputFormat,
                userId: user.id
              }
            });

            if (error) {
              console.error("Error in conversion process:", error);
              return { success: false, message: "Falha na conversão" };
            }

            // Record the conversion in the database
            const { error: recordError } = await supabase
              .from('conversions')
              .insert({
                original_filename: file.name,
                original_format: fileExtension,
                output_format: outputFormat,
                output_url: data.outputUrl || `/conversions/${outputFilename}`,
                user_id: user.id
              });
              
            if (recordError) {
              console.error("Error recording conversion:", recordError);
            }

            return {
              success: true,
              filename: file.name,
              outputUrl: data.outputUrl || `/conversions/${outputFilename}`
            };
          } 
          
          return { success: false, message: "Usuário não autenticado" };
        } catch (error) {
          console.error("Error processing file:", error);
          return { success: false, filename: file.name, error: "Erro no processamento" };
        }
      }));
      
      // Count successful conversions
      const successCount = convertedFiles.filter(r => r.success).length;
      
      // Show toast with result
      toast({
        title: successCount === files.length ? "Conversão concluída" : "Conversão parcialmente concluída",
        description: `${successCount} de ${files.length} arquivo(s) convertido(s) com sucesso!`,
      });

      // Trigger downloads for successful conversions
      convertedFiles.filter(f => f.success).forEach(file => {
        if ((file as any).outputUrl) {
          setTimeout(() => {
            // Create a link to download the file
            const link = document.createElement('a');
            link.href = (file as any).outputUrl;
            link.download = `${(file as any).filename.split('.')[0]}.${outputFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
              title: "Download iniciado",
              description: `Baixando ${(file as any).filename.split('.')[0]}.${outputFormat}...`,
            });
          }, 1000);
        }
      });
      
    } catch (error) {
      console.error("Error in conversion process:", error);
      toast({
        variant: "destructive",
        title: "Erro na conversão",
        description: "Ocorreu um erro durante o processo de conversão.",
      });
    } finally {
      setConverting(false);
    }
  };

  return {
    converting,
    outputFormat,
    setOutputFormat,
    handleConvert
  };
}
