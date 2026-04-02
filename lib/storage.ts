import { StorageClient } from "@supabase/storage-js";

// Only this file knows about the storage provider.
// To swap to S3/R2: replace the client initialisation below and update
// uploadFile / deleteFile implementations. No other file changes needed.

const storageClient = new StorageClient(
  `${process.env.SUPABASE_URL}/storage/v1`,
  { Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}` },
);

/**
 * Upload a file to a Supabase Storage bucket.
 *
 * @param bucket - Storage bucket name (e.g. 'permit-documents')
 * @param path   - Object path within the bucket (e.g. 'permits/{permitId}/{filename}')
 * @param file   - Browser File object to upload
 * @returns      - Public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const { data, error } = await storageClient
    .from(bucket)
    .upload(path, file, { upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = storageClient.from(bucket).getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a file from a Supabase Storage bucket.
 *
 * @param bucket - Storage bucket name
 * @param path   - Object path within the bucket to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await storageClient.from(bucket).remove([path]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}
