
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function HowItWorks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Como funciona</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
            1
          </div>
          <div>
            <h3 className="font-medium">Selecione os arquivos</h3>
            <p className="text-muted-foreground text-sm">
              Arraste ou clique para selecionar os arquivos PDF que deseja combinar
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
            2
          </div>
          <div>
            <h3 className="font-medium">Organize a ordem</h3>
            <p className="text-muted-foreground text-sm">
              Arraste os arquivos para reorganizar a ordem em que aparecerão no PDF final
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
            3
          </div>
          <div>
            <h3 className="font-medium">Clique em "Juntar PDFs e Baixar"</h3>
            <p className="text-muted-foreground text-sm">
              Processamos seus arquivos e disponibilizamos o PDF combinado para download
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-md mt-4">
          <h3 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" /> Seus arquivos estão seguros
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Todos os arquivos são processados no seu próprio navegador e não são enviados para servidores externos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
