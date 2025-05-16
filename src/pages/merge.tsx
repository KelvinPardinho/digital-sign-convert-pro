
import React from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

// Import our new components
import { DropZone } from "@/components/pdf-merge/DropZone";
import { FileList } from "@/components/pdf-merge/FileList";
import { HowItWorks } from "@/components/pdf-merge/HowItWorks";
import { PremiumBadge } from "@/components/pdf-merge/PremiumBadge";
import { usePdfMerge } from "@/hooks/usePdfMerge";

export default function MergePDF() {
  const { user } = useAuth();
  const isPremium = user?.plan === "premium";
  
  const {
    files,
    isProcessing,
    moveFileUp,
    moveFileDown,
    removeFile,
    onDragEnd,
    handleFileDrop,
    handleMerge
  } = usePdfMerge();

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Juntar PDFs</h1>
            <p className="text-muted-foreground">
              Combine vários arquivos PDF em um único documento
            </p>
          </div>
          
          {!isPremium && <PremiumBadge />}
        </div>

        <div className="grid md:grid-cols-7 gap-6">
          {/* Left side - Upload area and file list */}
          <div className="md:col-span-4 space-y-6">
            {/* Upload area */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione os PDFs para unir</CardTitle>
              </CardHeader>
              <CardContent>
                <DropZone 
                  onDrop={handleFileDrop(isPremium)}
                  isPremium={isPremium}
                />
              </CardContent>
            </Card>

            {/* File list - only show if there are files */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Arquivos selecionados ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileList
                    files={files}
                    onDragEnd={onDragEnd}
                    moveFileUp={moveFileUp}
                    moveFileDown={moveFileDown}
                    removeFile={removeFile}
                    onMerge={handleMerge}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right side - Instructions */}
          <div className="md:col-span-3">
            <HowItWorks />
          </div>
        </div>
      </div>
    </Layout>
  );
}
