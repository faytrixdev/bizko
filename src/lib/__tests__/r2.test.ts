import { describe, it, expect, beforeEach } from "vitest";
import { buildPublicUrl, keyFromPublicUrl, R2_CONFIG } from "../r2";

beforeEach(() => {
  process.env.R2_PUBLIC_URL = "https://media.bizko.pro";
});

describe("buildPublicUrl", () => {
  it("joins base and key and strips trailing slash", () => {
    expect(buildPublicUrl("portfolio/u/123.mp4")).toBe("https://media.bizko.pro/portfolio/u/123.mp4");
  });
  it("handles base with trailing slash", () => {
    process.env.R2_PUBLIC_URL = "https://media.bizko.pro/";
    expect(buildPublicUrl("a/b.mp4")).toBe("https://media.bizko.pro/a/b.mp4");
  });
});

describe("keyFromPublicUrl", () => {
  it("extracts key from matching public url", () => {
    expect(keyFromPublicUrl("https://media.bizko.pro/portfolio/u/123.mp4")).toBe("portfolio/u/123.mp4");
  });
  it("returns null for non-R2 url", () => {
    expect(keyFromPublicUrl("https://supabase.co/other.mp4")).toBeNull();
  });
  it("handles base with trailing slash", () => {
    process.env.R2_PUBLIC_URL = "https://media.bizko.pro/";
    expect(keyFromPublicUrl("https://media.bizko.pro/portfolio/u/123.mp4")).toBe("portfolio/u/123.mp4");
  });
});

describe("R2_CONFIG", () => {
  it("caps minted uploads at 150 MB", () => {
    expect(R2_CONFIG.maxVideoSizeBytes).toBe(150 * 1024 * 1024);
  });
});
