import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID!;
const bucket = process.env.R2_BUCKET!;

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_CONFIG = {
  maxVideoSizeBytes: 150 * 1024 * 1024,
  presignExpiresSec: 600,
};

export function isValidR2Config(): boolean {
  return Boolean(accountId && bucket && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_PUBLIC_URL);
}

export async function createPresignedPut(key: string, contentType: string): Promise<string | null> {
  if (!isValidR2Config()) return null;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn: R2_CONFIG.presignExpiresSec });
}

export function buildPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function deleteR2Object(key: string): Promise<void> {
  if (!isValidR2Config()) return;
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    /* best-effort cleanup, never throw */
  }
}

export function keyFromPublicUrl(publicUrl: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  if (!base) return null;
  if (!publicUrl.startsWith(base + "/")) return null;
  return publicUrl.slice(base.length + 1);
}
