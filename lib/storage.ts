import { StorageClient } from "@supabase/storage-js";

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("storage client — url:", url);
  console.log("storage client — key prefix:", key?.slice(0, 20));

  if (!url || !key) {
    throw new Error(
      `Storage misconfigured — SUPABASE_URL: ${!!url}, key: ${!!key}`,
    );
  }

  return new StorageClient(`${url}/storage/v1`, {
    apikey: key,
    Authorization: `Bearer ${key}`,
  });
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const client = getStorageClient();
  console.log("uploadFile — bucket:", bucket, "path:", path);

  const { data, error } = await client
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Supabase upload error:", JSON.stringify(error));
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = client.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const client = getStorageClient();

  const { error } = await client.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
