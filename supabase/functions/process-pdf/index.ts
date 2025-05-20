
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função auxiliar para criar cliente Supabase
const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  
  // Pegar o token JWT do cabeçalho de autorização
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '') ?? '';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } }
  });
};

serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação pelo ambiente
    const supabase = createSupabaseClient(req);
    
    // Verificar a sessão do usuário
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: "Usuário não autenticado", 
          details: userError?.message ?? "Token inválido ou expirado" 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Processar solicitação
    const { operation, files, password } = await req.json();
    
    // Verificar plano do usuário para operações premium
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    if (userDataError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar plano do usuário", details: userDataError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isPremium = userData.plan === 'premium';
    const premiumOperations = ['merge', 'ocr'];
    
    if (premiumOperations.includes(operation) && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Operação disponível apenas para usuários premium" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Registrar operação
    await supabase
      .from('pdf_operations')
      .insert({
        user_id: user.id,
        operation: operation,
        file_count: Array.isArray(files) ? files.length : 1,
        status: 'completed'
      })
      .select();
    
    // Processar com base na operação
    let result;
    switch (operation) {
      case 'merge':
        // Em uma implementação real, integraríamos com bibliotecas de PDF aqui
        result = {
          success: true,
          message: "PDFs mesclados com sucesso",
          outputUrl: `/output/merged-${Date.now()}.pdf`
        };
        break;
        
      case 'ocr':
        result = {
          success: true,
          message: "OCR aplicado com sucesso",
          outputUrl: `/output/ocr-${Date.now()}.pdf`
        };
        break;
        
      case 'split':
        result = {
          success: true,
          message: "PDF dividido com sucesso",
          outputUrls: [
            `/output/split-1-${Date.now()}.pdf`,
            `/output/split-2-${Date.now()}.pdf`
          ]
        };
        break;
        
      case 'protect':
        result = {
          success: true,
          message: "PDF protegido com sucesso",
          outputUrl: `/output/protected-${Date.now()}.pdf`
        };
        break;
        
      case 'unlock':
        // Verificar se a senha foi fornecida
        if (!password) {
          return new Response(
            JSON.stringify({ error: "Senha não fornecida" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        result = {
          success: true,
          message: "PDF desbloqueado com sucesso",
          outputUrl: `/output/unlocked-${Date.now()}.pdf`
        };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Operação inválida" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Erro na função process-pdf:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Ocorreu um erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
