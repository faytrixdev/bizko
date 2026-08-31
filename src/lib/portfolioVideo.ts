export const VIDEO_CONFIG = {
  maxSizeMB: 50,
  maxSizeBytes: 50 * 1024 * 1024,
  maxDurationSec: 60,
  allowedMimeTypes: ["video/mp4", "video/webm"] as readonly string[],
};

export function validateVideoFile(file: { type: string; size: number }): string | null {
  if (!VIDEO_CONFIG.allowedMimeTypes.includes(file.type)) {
    return "videoUnsupported";
  }
  if (file.size > VIDEO_CONFIG.maxSizeBytes) {
    return "videoTooLarge";
  }
  return null;
}

export function validateVideoDuration(durationSec: number): string | null {
  if (durationSec > VIDEO_CONFIG.maxDurationSec) {
    return "videoTooLong";
  }
  return null;
}
