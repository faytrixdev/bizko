import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAllowedContentType, type R2MediaKind } from "./mediaKinds";

/**
 * S3/R2 primitives. Server-only: this module constructs the AWS SDK client, so
 * it must never be imported from a client component. The pure media-kind
 * policy lives in `mediaKinds.ts` precisely so client code can use it safely.
 */

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
  // Absolute safety ceiling for a single video object (>= highest plan limit).
  maxVideoSizeBytes: 500 * 1024 * 1024,
  // Bucket-level ceiling for image objects. The real cap is the portfolio
  // image limit (see `imageSizeLimitBytes`); this only backstops a client
  // that lies about its own output before signing.
  maxImageSizeBytes: 8 * 1024 * 1024,
  presignExpiresSec: 600,
};

export function isS3Configured(): boolean {
  return Boolean(accountId && bucket && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

export function isValidR2Config(): boolean {
  return isS3Configured() && Boolean(process.env.R2_PUBLIC_URL);
}

export async function createPresignedPut(
  key: string,
  contentType: string,
  kind: R2MediaKind
): Promise<string | null> {
  if (!isS3Configured()) return null;
  if (!isAllowedContentType(kind, contentType)) return null;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn: R2_CONFIG.presignExpiresSec });
}

/**
 * Métadonnées réelles d'un objet. Sert à vérifier APRÈS l'upload la taille
 * effectivement reçue : la taille annoncée par le client avant signature
 * n'est qu'un confort d'UX, elle n'est pas opposable.
 */
export async function headR2Object(
  key: string
): Promise<{ size: number; contentType: string | null } | null> {
  if (!isS3Configured()) return null;
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { size: Number(res.ContentLength ?? 0), contentType: res.ContentType ?? null };
  } catch {
    return null;
  }
}

/**
 * Nombre d'objets sous un préfixe (ex: `portfolio/<uid>/`). Permet de plafonner
 * les fichiers orphelins : sans cela, un utilisateur pouvait téléverser des
 * médias sans jamais créer la ligne `portfolio_items` correspondante, et donc
 * sans jamais atteindre la limite de son plan.
 */
export async function countR2Objects(prefix: string, hardCap = 5000): Promise<number | null> {
  if (!isS3Configured()) return null;
  try {
    let count = 0;
    let token: string | undefined;
    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: token,
        })
      );
      count += res.KeyCount ?? res.Contents?.length ?? 0;
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
      if (count > hardCap) break;
    } while (token);
    return count;
  } catch {
    return null;
  }
}

export function buildPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function deleteR2Object(key: string): Promise<void> {
  if (!isS3Configured()) return;
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

// Re-exported so server routes have a single import for the storage surface,
// while the pure policy stays importable from the client.
export * from "./mediaKinds";
