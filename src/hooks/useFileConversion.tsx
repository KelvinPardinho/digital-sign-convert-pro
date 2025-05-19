
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
  const { user } = useAuth();

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
      // Array to store promises for parallel processing
      const conversionPromises = files.map(async (file) => {
        // Get the file extension (format)
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        // Create a unique filename for the output file
        const outputFilename = `${file.name.split('.')[0]}_${Date.now()}.${outputFormat}`;
        
        // In a real implementation, we would send the file to a conversion service
        // For now, simulate the conversion process
        
        // Simulate file upload to storage
        if (user) {
          try {
            // First upload the file to Supabase Storage (in a real app)
            // For now, we'll just simulate this part
            
            // Then record the conversion in the database
            const { data, error } = await supabase
              .from('conversions')
              .insert({
                original_filename: file.name.split('.')[0],
                original_format: fileExtension,
                output_format: outputFormat,
                output_url: `/conversions/${outputFilename}`,
                user_id: user.id
              })
              .select()
              .single();
              
            if (error) {
              console.error("Error recording conversion:", error);
            }
            
            return {
              success: true,
              filename: file.name,
              outputUrl: `/conversions/${outputFilename}`
            };
          } catch (error) {
            console.error("Error during conversion process:", error);
            return {
              success: false,
              filename: file.name,
              error: "Falha na conversão"
            };
          }
        } else {
          // For users not logged in, just simulate the conversion
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            success: true,
            filename: file.name,
            outputUrl: `/conversions/${outputFilename}`
          };
        }
      });
      
      // Wait for all conversions to complete
      const results = await Promise.all(conversionPromises);
      
      // Count successful conversions
      const successCount = results.filter(r => r.success).length;
      
      // Show toast with result
      toast({
        title: successCount === files.length ? "Conversão concluída" : "Conversão parcialmente concluída",
        description: `${successCount} de ${files.length} arquivo(s) convertido(s) com sucesso!`,
      });
      
      // In a real application, we would redirect to the downloads or provide download links
      
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
