import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Config S3/MinIO dari env. Semua field wajib di production — dev pakai default MinIO local.
const endpoint = process.env.S3_ENDPOINT ?? "http://127.0.0.1:9002";
const region = process.env.S3_REGION ?? "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY ?? "senopati";
const secretAccessKey = process.env.S3_SECRET_KEY ?? "senopati-storage-secret";
const bucket = process.env.S3_BUCKET ?? "senopati-academy";
const publicBase = process.env.S3_PUBLIC_URL ?? `${endpoint}/${bucket}`;
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== "false"; // MinIO butuh true

const globalForS3 = globalThis as unknown as { __s3Client?: S3Client };

export const s3 =
  globalForS3.__s3Client ??
  new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle,
  });
if (process.env.NODE_ENV !== "production") globalForS3.__s3Client = s3;

export const S3_BUCKET = bucket;
export const S3_PUBLIC_BASE = publicBase;

/**
 * Public URL untuk object yang sudah di-upload. Bucket di-set public read,
 * jadi URL ini langsung accessible di browser (tidak butuh signed URL).
 */
export function publicUrl(objectKey: string): string {
  return `${publicBase.replace(/\/$/, "")}/${objectKey.replace(/^\//, "")}`;
}

/**
 * Generate presigned PUT URL supaya client bisa upload langsung ke MinIO
 * tanpa route melalui Next.js server (hemat memory, bandwidth server).
 * Expires di 10 menit — cukup untuk file 50MB di koneksi normal.
 */
export async function getPresignedUploadUrl(params: {
  objectKey: string;
  contentType: string;
  contentLengthMax?: number;
}): Promise<{ url: string; publicUrl: string; expiresAt: Date }> {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: params.objectKey,
    ContentType: params.contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 10 });
  const expiresAt = new Date(Date.now() + 60 * 10 * 1000);
  return { url, publicUrl: publicUrl(params.objectKey), expiresAt };
}

/**
 * Hapus object di MinIO. Non-throw — kalau file sudah tidak ada, tetap anggap sukses.
 */
export async function deleteObject(objectKey: string): Promise<void> {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
  } catch (err) {
    console.error("[storage] deleteObject failed:", err);
  }
}

/**
 * Verify object ada + dapatkan size/content-type setelah client bilang upload
 * sukses. Guard kalau client mengaku sudah upload tapi file tidak ada.
 */
export async function headObject(
  objectKey: string,
): Promise<{ size: number; contentType: string | null } | null> {
  try {
    const res = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return {
      size: res.ContentLength ?? 0,
      contentType: res.ContentType ?? null,
    };
  } catch {
    return null;
  }
}
