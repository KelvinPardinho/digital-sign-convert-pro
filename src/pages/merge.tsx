
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DropZone } from "@/components/pdf-merge/DropZone";
import { FileList } from "@/components/pdf-merge/FileList";
import { usePdfMerge } from "@/hooks/usePdfMerge";
import { useAuth } from "@/providers/AuthProvider";

export default function Merge() {
  const { 
    files, 
    isProcessing, 
    moveFileUp, 
    moveFileDown, 
    removeFile, 
    onDragEnd, 
    handleFileDrop, 
    handleMerge,
  } = usePdfMerge();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Juntar PDFs</h1>
        <p className="text-muted-foreground mb-6">
          Combine vários arquivos PDF em um único documento.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Selecione os arquivos para juntar</CardTitle>
            <CardDescription>
              Arraste e solte os arquivos PDF para organizá-los na ordem desejada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropZone 
              onDrop={handleFileDrop}
              isPremium={true} // Changed to true for all users since merging is now available for free users
            />
            
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
      </div>
    </Layout>
  );
}
