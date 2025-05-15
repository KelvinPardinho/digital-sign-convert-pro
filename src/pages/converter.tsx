
import { useState } from 'react';
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/AuthProvider";
import { FileWithPreview } from '@/types/file';
import { ToPdfTab } from '@/components/converter/ToPdfTab';
import { FromPdfTab } from '@/components/converter/FromPdfTab';
import { useFileConversion } from '@/hooks/useFileConversion';

export default function Converter() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [conversionType, setConversionType] = useState<string>("to-pdf");
  const { converting, outputFormat, setOutputFormat, handleConvert } = useFileConversion();

  // Clear files when switching tabs
  const handleTabChange = (value: string) => {
    // Clear any previews to prevent memory leaks
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    setConversionType(value);
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Conversor de Documentos</h1>
            <p className="text-muted-foreground">
              Converta seus arquivos entre vários formatos com facilidade
            </p>
          </div>
        </div>

        <Tabs defaultValue="to-pdf" className="mb-8" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="to-pdf">Para PDF</TabsTrigger>
            <TabsTrigger value="from-pdf">Do PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="to-pdf" className="pt-4">
            <ToPdfTab
              files={files}
              setFiles={setFiles}
              converting={converting}
              handleConvert={() => handleConvert(files)}
              userPlan={user?.plan}
            />
          </TabsContent>
          <TabsContent value="from-pdf" className="pt-4">
            <FromPdfTab
              files={files}
              setFiles={setFiles}
              converting={converting}
              outputFormat={outputFormat}
              setOutputFormat={setOutputFormat}
              handleConvert={() => handleConvert(files)}
              userPlan={user?.plan}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
