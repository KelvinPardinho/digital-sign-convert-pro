
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create Supabase client
const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  
  // Get JWT token from authorization header
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '') ?? '';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

// Helper to process PDF operations
const processPdfOperation = async (operation: string, fileUrl: string, fileId: string, userId: string, options: any = {}) => {
  console.log(`Processing ${operation} operation for file ${fileId}`);
  
  // In a real implementation, we would use PDF libraries to process the file
  // For this demo, we'll simulate the processing and return mock results
  
  // Simulated delay to mimic processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate timestamp for unique filenames
  const timestamp = new Date().getTime();
  
  // Define the base URL for processed files
  const baseUrl = `https://tpvywtsldvdsovsdxamn.supabase.co/storage/v1/object/public/pdf-operations/processed/${userId}`;
  
  // Handle different operations
  switch (operation) {
    case 'merge': {
      const outputFilename = `merged-${timestamp}.pdf`;
      const outputUrl = `${baseUrl}/${outputFilename}`;
      return {
        success: true,
        message: "PDFs mesclados com sucesso",
        outputUrl
      };
    }
      
    case 'ocr': {
      const outputFilename = `ocr-${timestamp}.pdf`;
      const outputUrl = `${baseUrl}/${outputFilename}`;
      return {
        success: true,
        message: "OCR aplicado com sucesso",
        outputUrl
      };
    }
      
    case 'split': {
      // Parse page ranges
      const pageRanges = options.pageRanges ? options.pageRanges.split(',') : ['1-3', '4-5'];
      const outputUrls = pageRanges.map((range: string, index: number) => {
        const outputFilename = `split-${index+1}-${timestamp}.pdf`;
        return `${baseUrl}/${outputFilename}`;
      });
      
      return {
        success: true,
        message: `PDF dividido em ${outputUrls.length} partes com sucesso`,
        outputUrls
      };
    }
      
    case 'protect': {
      if (!options.password) {
        return {
          success: false,
          error: "Senha não fornecida"
        };
      }
      
      const outputFilename = `protected-${timestamp}.pdf`;
      const outputUrl = `${baseUrl}/${outputFilename}`;
      return {
        success: true,
        message: "PDF protegido com sucesso",
        outputUrl
      };
    }
      
    case 'unlock': {
      if (!options.password) {
        return {
          success: false,
          error: "Senha não fornecida"
        };
      }
      
      const outputFilename = `unlocked-${timestamp}.pdf`;
      const outputUrl = `${baseUrl}/${outputFilename}`;
      return {
        success: true,
        message: "PDF desbloqueado com sucesso",
        outputUrl
      };
    }
      
    default:
      return {
        success: false,
        error: "Operação inválida"
      };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const supabase = createSupabaseClient(req);
    
    // Verify user session
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
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Corpo da requisição inválido", details: e.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { operation, fileUrl, fileUrls, fileId, fileName, fileSize, fileType, userId, ...options } = requestBody;
    
    if (!operation || (!fileUrl && !fileUrls)) {
      return new Response(
        JSON.stringify({ error: "Operação ou arquivo não especificado" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check user plan for premium operations
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();
    
    if (userDataError) {
      return new Response(
        JSON.stringify({ error: "Erro ao verificar plano do usuário", details: userDataError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isPremium = userData?.plan === 'premium';
    const premiumOperations = ['merge', 'ocr'];
    
    if (premiumOperations.includes(operation) && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Operação disponível apenas para usuários premium" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the PDF operation
    const result = operation === 'merge' && fileUrls
      ? await processPdfOperation(operation, '', fileId, userId, { fileUrls, ...options })
      : await processPdfOperation(operation, fileUrl, fileId, userId, options);
    
    // Record the operation if successful
    if (result.success) {
      try {
        const { error: operationError } = await supabase
          .from('pdf_operations')
          .insert({
            user_id: user.id,
            operation: operation,
            file_name: fileName || 'unknown',
            file_size: fileSize || 0,
            status: 'completed'
          });
          
        if (operationError) {
          console.error("Error recording operation:", operationError);
        }
      } catch (e) {
        console.error("Failed to record operation:", e);
        // Continue anyway as this is not critical
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Erro na função process-pdf:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Ocorreu um erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
