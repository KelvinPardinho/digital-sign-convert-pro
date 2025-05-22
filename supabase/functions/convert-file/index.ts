
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

// Helper to process file conversion
const processConversion = async (fileUrl: string, originalFormat: string, outputFormat: string, fileId: string, userId: string) => {
  console.log(`Converting file from ${originalFormat} to ${outputFormat}`);
  
  try {
    // Download the original file content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const fileContent = await response.blob();
    
    // In a real implementation, we would use external APIs or libraries to convert the file
    // For this simulation, we'll create a dummy output file based on the requested format
    
    // Create a storage client to upload the converted file
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate output file name with timestamp
    const timestamp = new Date().getTime();
    const outputFileName = `converted_${fileId}_${timestamp}.${outputFormat}`;
    const outputPath = `converted/${userId}/${outputFileName}`;
    
    // Upload the "converted" file (in reality, just the same file with different extension for demo)
    const { error: uploadError } = await supabase
      .storage
      .from('conversions')
      .upload(outputPath, fileContent);
      
    if (uploadError) {
      throw new Error(`Error uploading converted file: ${uploadError.message}`);
    }
    
    // Get public URL for the output file
    const { data: publicUrlData } = supabase
      .storage
      .from('conversions')
      .getPublicUrl(outputPath);
      
    return {
      originalFormat,
      outputFormat, 
      outputUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error("Error processing conversion:", error);
    throw error;
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
    
    // Check for premium-only conversions (based on requirements, all formats are allowed for all users)
    const premiumFormats = []; // Empty since all formats are now allowed for free users
    
    if (premiumFormats.includes(outputFormat) && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Conversão disponível apenas para usuários premium" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the conversion
    try {
      // Ensure the conversions bucket exists
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      
      try {
        const { error: bucketError } = await serviceClient
          .storage
          .getBucket('conversions');
          
        if (bucketError) {
          if (bucketError.message.includes('does not exist')) {
            await serviceClient.storage.createBucket('conversions', { public: true });
          } else {
            throw bucketError;
          }
        }
      } catch (e) {
        console.error("Error checking/creating conversions bucket:", e);
      }
      
      const conversionResult = await processConversion(
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
      throw new Error(`Conversion processing error: ${error.message}`);
    }
  } catch (error) {
    console.error(`Erro na função convert-file:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Ocorreu um erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
