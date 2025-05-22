
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

// Helper to simulate file conversion
const simulateConversion = async (fileUrl: string, originalFormat: string, outputFormat: string, fileId: string, userId: string) => {
  console.log(`Converting file from ${originalFormat} to ${outputFormat}`);
  
  // In a real implementation, we would use external APIs or libraries to convert the file
  // For this demo, we'll simulate the conversion by creating a mock output URL
  
  // Simulated delay to mimic processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Define base URL
  const baseUrl = `https://tpvywtsldvdsovsdxamn.supabase.co/storage/v1/object/public/conversions/converted/${userId}`;
  
  // Generate a mock output URL that would be the converted file's location
  const timestamp = new Date().getTime();
  const outputFilename = `${fileId}-${timestamp}.${outputFormat}`;
  const outputUrl = `${baseUrl}/${outputFilename}`;
  
  return {
    originalFormat,
    outputFormat, 
    outputUrl
  };
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
    
    const { fileUrl, fileId, originalFilename, originalFormat, outputFormat, userId } = requestBody;
    
    if (!fileUrl || !originalFormat || !outputFormat || !userId) {
      return new Response(
        JSON.stringify({ error: "Parâmetros insuficientes" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify that the user has appropriate plan for certain conversions
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
    
    // Check for premium-only conversions
    const premiumFormats = ['docx', 'xlsx'];
    if (premiumFormats.includes(outputFormat) && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Conversão disponível apenas para usuários premium" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Simulate the conversion process
    // In a production environment, you would use a real conversion service here
    const conversionResult = await simulateConversion(
      fileUrl, 
      originalFormat, 
      outputFormat,
      fileId,
      userId
    );
    
    // Log the operation
    try {
      const { error: operationError } = await supabase
        .from('conversions')
        .insert({
          user_id: user.id,
          original_filename: originalFilename,
          original_format: originalFormat,
          output_format: outputFormat,
          output_url: conversionResult.outputUrl
        });
        
      if (operationError) {
        console.error("Error recording conversion operation:", operationError);
      }
    } catch (e) {
      console.error("Failed to record conversion:", e);
      // Continue anyway as this is not critical
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Arquivo convertido com sucesso",
        outputUrl: conversionResult.outputUrl,
        originalFormat,
        outputFormat
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Erro na função convert-file:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Ocorreu um erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
