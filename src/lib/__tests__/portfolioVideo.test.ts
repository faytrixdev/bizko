import { describe, it, expect } from "vitest";
import { validateVideoFile, validateVideoDuration, VIDEO_CONFIG } from "../portfolioVideo";

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateVideoFile", () => {
  it("accepts a valid mp4 under limits", () => {
    const err = validateVideoFile(makeFile("clip.mp4", "video/mp4", 10 * 1024 * 1024));
    expect(err).toBeNull();
  });

  it("rejects wrong mime type", () => {
    const err = validateVideoFile(makeFile("clip.gif", "image/gif", 1000));
    expect(err).toBe("videoUnsupported");
  });

  it("rejects files over 50 MB", () => {
    const err = validateVideoFile(makeFile("big.mp4", "video/mp4", VIDEO_CONFIG.maxSizeBytes + 1));
    expect(err).toBe("videoTooLarge");
  });

  it("accepts exact size limit", () => {
    const err = validateVideoFile(makeFile("edge.mp4", "video/mp4", VIDEO_CONFIG.maxSizeBytes));
    expect(err).toBeNull();
  });

  it("exposes config constants", () => {
    expect(VIDEO_CONFIG.maxSizeMB).toBe(50);
    expect(VIDEO_CONFIG.maxSizeBytes).toBe(50 * 1024 * 1024);
    expect(VIDEO_CONFIG.maxDurationSec).toBe(60);
  });
});

describe("validateVideoDuration", () => {
  it("accepts durations at or under limit", () => {
    expect(validateVideoDuration(60)).toBeNull();
    expect(validateVideoDuration(1)).toBeNull();
  });

  it("rejects durations over limit", () => {
    const err = validateVideoDuration(61);
    expect(err).toBe("videoTooLong");
  });
});
