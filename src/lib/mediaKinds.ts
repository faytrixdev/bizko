/**
 * Media-kind policy for object storage. Deliberately dependency-free: it must
 * stay importable from client components, so it must never pull in the S3 SDK
 * that `lib/r2.ts` depends on. Only `import type`-level, pure data lives here.
 */

/**
 * The kinds of object the bucket holds. Each one owns a separate key prefix.
 *
 * `countR2Objects` is used as an anti-abuse guard against orphaned uploads
 * (objects with no `portfolio_items` row to justify them). That guard is only
 * exact when a prefix holds a single kind of media: sharing one prefix between
 * videos and photos would make the video orphan guard count photos too, and a
 * member with 30 photos would false-trip `videos_limit` and be locked out of
 * every future upload.
 */
export type R2MediaKind = "video" | "image" | "thumb" | "avatar";

const KIND_PREFIX: Record<R2MediaKind, string> = {
  video: "portfolio",
  image: "images",
  thumb: "thumbs",
  avatar: "avatars",
};

export const R2_MEDIA_KINDS: readonly R2MediaKind[] = ["video", "image", "thumb", "avatar"];

export function isR2MediaKind(value: unknown): value is R2MediaKind {
  return typeof value === "string" && (R2_MEDIA_KINDS as readonly string[]).includes(value);
}

/** Key prefix owned by a single member, for one kind of media. */
export function r2KeyPrefix(kind: R2MediaKind, userId: string): string {
  return `${KIND_PREFIX[kind]}/${userId}/`;
}

/**
 * Accepted MIME types per kind.
 *
 * The type is validated server-side before signing, because a presigned PUT
 * freezes the Content-Type: without that check a client could park
 * `text/html` in the bucket served by media.bizko.pro and have it served as
 * HTML from our own domain.
 */
export const VIDEO_CONTENT_TYPE = "video/mp4";
export const IMAGE_CONTENT_TYPE = "image/webp";
export const AVATAR_CONTENT_TYPE = "image/jpeg";

const ALLOWED_CONTENT_TYPES: Record<R2MediaKind, readonly string[]> = {
  video: ["video/mp4", "video/webm"],
  image: ["image/webp", "image/jpeg"],
  thumb: ["image/webp", "image/jpeg"],
  avatar: ["image/jpeg", "image/webp"],
};

const DEFAULT_CONTENT_TYPE: Record<R2MediaKind, string> = {
  video: VIDEO_CONTENT_TYPE,
  image: IMAGE_CONTENT_TYPE,
  thumb: IMAGE_CONTENT_TYPE,
  avatar: AVATAR_CONTENT_TYPE,
};

export const ALLOWED_VIDEO_CONTENT_TYPES: readonly string[] = ALLOWED_CONTENT_TYPES.video;

export function isAllowedContentType(kind: R2MediaKind, value: string): boolean {
  return ALLOWED_CONTENT_TYPES[kind].includes(value);
}

export function isAllowedVideoContentType(value: string): boolean {
  return isAllowedContentType("video", value);
}

/**
 * Coerces a client-requested Content-Type to one actually allowed for `kind`,
 * falling back to that kind's canonical type. Never widens the allowlist: an
 * unknown type is replaced, not trusted.
 */
export function resolveContentType(kind: R2MediaKind, requested: unknown): string {
  if (typeof requested === "string" && isAllowedContentType(kind, requested)) return requested;
  return DEFAULT_CONTENT_TYPE[kind];
}

/**
 * Strips the extension and every character that is not safe in an object key.
 * The result is always non-empty, so a key can never degenerate into a bare
 * timestamp with a dangling separator.
 */
export function safeObjectName(raw: string, fallback: string): string {
  const base = raw
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/** `portfolio/<uid>/<ts>-<safe-name>.mp4` — unchanged format, existing videos keep resolving. */
export function buildVideoKey(userId: string, name: string, timestamp: number): string {
  return `${r2KeyPrefix("video", userId)}${timestamp}-${safeObjectName(name, "video")}.mp4`;
}

/** `images/<uid>/<ts>-<safe-name>.webp` — a portfolio photo. */
export function buildImageKey(userId: string, name: string, timestamp: number): string {
  return `${r2KeyPrefix("image", userId)}${timestamp}-${safeObjectName(name, "photo")}.webp`;
}

/** `thumbs/<uid>/<ts>-<safe-name>.webp` — a video poster frame. */
export function buildThumbKey(userId: string, name: string, timestamp: number): string {
  return `${r2KeyPrefix("thumb", userId)}${timestamp}-${safeObjectName(name, "thumb")}.webp`;
}

/** `avatars/<uid>/avatar-<ts>.jpg` */
export function buildAvatarKey(userId: string, timestamp: number): string {
  return `${r2KeyPrefix("avatar", userId)}avatar-${timestamp}.jpg`;
}

/** Object key for an upload of `kind`, with a format fixed per kind. */
export function buildKeyFor(kind: R2MediaKind, userId: string, name: string, timestamp: number): string {
  switch (kind) {
    case "video":
      return buildVideoKey(userId, name, timestamp);
    case "image":
      return buildImageKey(userId, name, timestamp);
    case "thumb":
      return buildThumbKey(userId, name, timestamp);
    case "avatar":
      return buildAvatarKey(userId, timestamp);
  }
}

/**
 * True when `key` sits under the member's own folder for one of the media
 * kinds. This is the authorization check every mutating R2 route must run
 * before touching a key the client sent: it keeps a member from writing or
 * deleting inside another member's prefix, and rejects traversal.
 */
export function isOwnedR2Key(kind: R2MediaKind, userId: string, key: unknown): key is string {
  if (typeof key !== "string" || key.length === 0 || key.includes("..")) return false;
  return key.startsWith(r2KeyPrefix(kind, userId));
}
