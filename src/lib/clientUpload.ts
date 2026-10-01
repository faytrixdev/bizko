import type { R2MediaKind } from "./mediaKinds";

/**
 * Browser-side upload flow for one object: sign -> PUT -> verify.
 *
 * The client never holds storage credentials. It asks the server for a
 * presigned URL bound to a key and a frozen Content-Type, PUTs the bytes
 * straight to the bucket, then asks the server to re-read the real object
 * (HEAD) to enforce the plan limits that a presigned PUT cannot bind.
 */

/** Carries the server's machine-readable error code so callers can map it to an i18n message. */
export class R2UploadError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "R2UploadError";
    this.code = code;
  }
}

export interface R2UploadResult {
  publicUrl: string;
  key: string;
  kind: R2MediaKind;
}

async function readErrorCode(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: unknown };
  return typeof body.error === "string" ? body.error : `http_${res.status}`;
}

/**
 * Best-effort cleanup of an object that was uploaded but will not be referenced.
 *
 * Pass the `key` returned by `uploadR2Object`. To clean up an object that was
 * only ever stored as a URL (a replaced avatar), pass `publicUrl` instead: the
 * server resolves it and checks ownership, so the bucket base URL stays server-side.
 */
export async function deleteR2OnServer(
  target: { key: string } | { publicUrl: string },
  kind: R2MediaKind
): Promise<void> {
  try {
    await fetch("/api/r2/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...target }),
    });
  } catch {
    // cleanup is best-effort; ignore failures
  }
}

export async function uploadR2Object(
  blob: Blob,
  kind: R2MediaKind,
  name: string
): Promise<R2UploadResult> {
  const signRes = await fetch("/api/r2/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, size: blob.size, name, contentType: blob.type }),
  });
  if (!signRes.ok) throw new R2UploadError(await readErrorCode(signRes));

  const { uploadUrl, publicUrl, key, contentType } = (await signRes.json()) as {
    uploadUrl?: string;
    publicUrl?: string;
    key?: string;
    contentType?: string;
  };
  if (typeof uploadUrl !== "string" || typeof publicUrl !== "string" || typeof key !== "string") {
    throw new R2UploadError("bad_sign_response");
  }

  let putRes: Response;
  try {
    // The header must match EXACTLY the Content-Type frozen into the presigned
    // signature, otherwise S3/R2 rejects the request.
    putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": typeof contentType === "string" ? contentType : blob.type },
      body: blob,
    });
  } catch {
    await deleteR2OnServer({ key }, kind);
    throw new R2UploadError("put_failed");
  }
  if (!putRes.ok) {
    // A rejected PUT means no object was created; deleting is a safe no-op and
    // covers the ambiguous case where the request reached R2 but was refused.
    await deleteR2OnServer({ key }, kind);
    throw new R2UploadError("put_failed");
  }

  // The size declared before signing is advisory: the server re-reads the real
  // object and deletes it itself if it is out of bounds or mistyped.
  const verifyRes = await fetch("/api/r2/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, key }),
  });
  if (!verifyRes.ok) throw new R2UploadError(await readErrorCode(verifyRes));

  return { publicUrl, key, kind };
}
