
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures a storage bucket exists, creating it if needed
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  // Check if the bucket exists
  const { data: bucketData, error: bucketError } = await supabase
    .storage
    .getBucket(bucketName);
    
  if (bucketError && bucketError.message.includes('does not exist')) {
    // Create the bucket if it doesn't exist
    await supabase.storage.createBucket(bucketName, { public: true });
  } else if (bucketError) {
    console.error("Error checking bucket:", bucketError);
    return false;
  }
  
  return true;
};

/**
 * Uploads a file to a Supabase storage bucket
 */
export const uploadFileToBucket = async (
  file: File, 
  userId: string, 
  bucketName: string,
  filePrefix = ''
): Promise<{ publicUrl: string; fileId: string } | null> => {
  try {
    const fileId = uuidv4();
    const fileName = `${filePrefix}${fileId}-${file.name}`;
    const filePath = `original/${userId}/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { publicUrl: publicUrlData.publicUrl, fileId };
  } catch (error) {
    console.error("Error in uploadFileToBucket:", error);
    return null;
  }
};

/**
 * Records a conversion operation in the database
 */
export const recordConversion = async (
  userId: string, 
  originalFilename: string, 
  originalFormat: string, 
  outputFormat: string, 
  outputUrl: string | null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversions')
      .insert({
        user_id: userId,
        original_filename: originalFilename,
        original_format: originalFormat,
        output_format: outputFormat,
        output_url: outputUrl
      });
      
    if (error) {
      console.error("Error recording conversion:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in recordConversion:", error);
    return false;
  }
};
