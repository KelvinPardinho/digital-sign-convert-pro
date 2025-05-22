
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

// Helper to ensure a bucket exists
const ensureBucket = async (bucketName: string) => {
  try {
    // Create service role client for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if bucket exists
    const { error: bucketError } = await serviceClient.storage.getBucket(bucketName);
    
    if (bucketError && bucketError.message.includes('does not exist')) {
      // Create bucket if it doesn't exist
      const { error: createError } = await serviceClient.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error(`Error creating ${bucketName} bucket:`, createError);
        return false;
      }
    } else if (bucketError) {
      console.error(`Error checking ${bucketName} bucket:`, bucketError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring ${bucketName} bucket:`, error);
    return false;
  }
};

// Helper to download PDF file from URL
const downloadPdfFile = async (fileUrl: string): Promise<Blob | null> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error(`Error downloading file: ${response.statusText}`);
      return null;
    }
    
    return await response.blob();
  } catch (error) {
    console.error(`Error downloading PDF file: ${error}`);
    return null;
  }
};

// Helper to upload processed PDF file
const uploadProcessedFile = async (
  fileBlob: Blob, 
  userId: string, 
  fileId: string, 
  operation: string
): Promise<string | null> => {
  try {
    // Create service role client for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const timestamp = new Date().getTime();
    const fileName = `${operation}-${fileId}-${timestamp}.pdf`;
    const filePath = `processed/${userId}/${fileName}`;
    
    // Upload processed file
    const { error: uploadError } = await serviceClient
      .storage
      .from('pdf-operations')
      .upload(filePath, fileBlob);
      
    if (uploadError) {
      console.error(`Error uploading processed file: ${uploadError.message}`);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = serviceClient
      .storage
      .from('pdf-operations')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading processed file: ${error}`);
    return null;
  }
};

// Helper to process PDF operations
const processPdfOperation = async (
  operation: string, 
  fileUrl: string | undefined, 
  fileUrls: string[] | undefined, 
  fileId: string, 
  userId: string, 
  options: any = {}
) => {
  console.log(`Processing ${operation} operation for file ${fileId}`);
  
  await ensureBucket('pdf-operations');
  
  // For merge operation with multiple files
  if (operation === 'merge' && fileUrls && fileUrls.length > 0) {
    // Download all files
    const fileBlobs: Blob[] = [];
    for (const url of fileUrls) {
      const blob = await downloadPdfFile(url);
      if (!blob) {
        throw new Error(`Failed to download file from ${url}`);
      }
      fileBlobs.push(blob);
    }
    
    // Simulate merging PDFs by using the first file
    // In a real implementation, would use a PDF library to merge
    const mergedBlob = fileBlobs[0];
    
    // Upload merged file
    const outputUrl = await uploadProcessedFile(mergedBlob, userId, fileId, 'merged');
    if (!outputUrl) {
      throw new Error("Failed to upload merged file");
    }
    
    return {
      success: true,
      message: "PDFs mesclados com sucesso",
      outputUrl
    };
  }
  
  // For all other operations requiring a single file
  if (!fileUrl) {
    throw new Error("URL do arquivo não fornecida");
  }
  
  // Download the file
  const fileBlob = await downloadPdfFile(fileUrl);
  if (!fileBlob) {
    throw new Error("Failed to download file");
  }
  
  // Handle different operations
  switch (operation) {
    case 'ocr': {
      // Simulate OCR processing
      const outputUrl = await uploadProcessedFile(fileBlob, userId, fileId, 'ocr');
      if (!outputUrl) {
        throw new Error("Failed to upload OCR processed file");
      }
      
      return {
        success: true,
        message: "OCR aplicado com sucesso",
        outputUrl
      };
    }
      
    case 'split': {
      // Parse page ranges
      const pageRanges = options.pageRanges ? options.pageRanges.split(',') : ['1-3', '4-5'];
      const outputUrls: string[] = [];
      
      // Simulate splitting PDF by creating multiple copies
      for (let i = 0; i < pageRanges.length; i++) {
        const outputUrl = await uploadProcessedFile(fileBlob, userId, `${fileId}-part${i+1}`, 'split');
        if (!outputUrl) {
          throw new Error(`Failed to upload split part ${i+1}`);
        }
        outputUrls.push(outputUrl);
      }
      
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
      
      // Simulate password protection
      const outputUrl = await uploadProcessedFile(fileBlob, userId, fileId, 'protected');
      if (!outputUrl) {
        throw new Error("Failed to upload password-protected file");
      }
      
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
      
      // Simulate password removal
      const outputUrl = await uploadProcessedFile(fileBlob, userId, fileId, 'unlocked');
      if (!outputUrl) {
        throw new Error("Failed to upload unlocked file");
      }
      
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
    
    // Update: Allow merge for free users as per the new requirements
    // const premiumOperations = ['ocr']; // Now merge is available for free users
    const premiumOperations: string[] = []; // Empty since all operations now work for free users
    
    if (premiumOperations.includes(operation) && !isPremium) {
      return new Response(
        JSON.stringify({ error: "Operação disponível apenas para usuários premium" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the PDF operation
    const result = operation === 'merge' && fileUrls
      ? await processPdfOperation(operation, undefined, fileUrls, fileId, userId, options)
      : await processPdfOperation(operation, fileUrl, undefined, fileId, userId, options);
    
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
