export const VIDEO_CONFIG = {
  maxSizeMB: 200,
  maxSizeBytes: 200 * 1024 * 1024,
  maxDurationSec: 180,
  allowedMimeTypes: ["video/mp4", "video/webm"] as readonly string[],
};

export function validateVideoFile(
  file: { type: string; size: number },
  opts?: { maxSizeBytes?: number }
): string | null {
  if (!VIDEO_CONFIG.allowedMimeTypes.includes(file.type)) {
    return "videoUnsupported";
  }
  const max = opts?.maxSizeBytes ?? VIDEO_CONFIG.maxSizeBytes;
  if (file.size > max) {
    return "videoTooLarge";
  }
  return null;
}

export function validateVideoDuration(
  durationSec: number,
  opts?: { maxDurationSec?: number }
): string | null {
  if (!Number.isFinite(durationSec)) {
    return null;
  }
  const max = opts?.maxDurationSec ?? VIDEO_CONFIG.maxDurationSec;
  if (durationSec > max) {
    return "videoTooLong";
  }
  return null;
}
