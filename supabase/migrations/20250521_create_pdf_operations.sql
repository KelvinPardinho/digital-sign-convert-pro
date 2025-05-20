
-- Criar tabela para registro de operações de PDF
CREATE TABLE IF NOT EXISTS public.pdf_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  operation TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.pdf_operations ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários ver suas próprias operações
CREATE POLICY "Usuários podem ver suas próprias operações" 
  ON public.pdf_operations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir usuários inserir suas próprias operações
CREATE POLICY "Usuários podem criar suas próprias operações" 
  ON public.pdf_operations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir admins ver todas operações
CREATE POLICY "Admins podem ver todas operações" 
  ON public.pdf_operations 
  FOR ALL 
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));
