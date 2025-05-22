
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures a storage bucket exists, creating it if needed
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Check if the bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);
      
    if (bucketError && bucketError.message.includes('does not exist')) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
      
      // Set bucket policies to allow authenticated users to upload/download
      // Fix for type error: Using proper type casting for the RPC call
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: `${bucketName}_policy`,
        definition: `auth.uid() IS NOT NULL`
      } as unknown as Record<string, unknown>);
      
      if (policyError) {
        console.error("Error setting bucket policy:", policyError);
        // Continue anyway as the bucket is created
      }
      
      return true;
    } else if (bucketError) {
      console.error("Error checking bucket:", bucketError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in ensureBucketExists:", error);
    return false;
  }
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
    // Ensure bucket exists before uploading
    const bucketExists = await ensureBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket ${bucketName} does not exist and could not be created`);
    }
    
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

/**
 * Gets a list of conversions for a specific user
 */
export const getUserConversions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching user conversions:", error);
      return [];
    }
    
    // Add file type information based on original_format
    return data?.map(conversion => ({
      ...conversion,
      type: conversion.original_format.toLowerCase() // Add type property derived from original_format
    })) || [];
  } catch (error) {
    console.error("Error in getUserConversions:", error);
    return [];
  }
};
