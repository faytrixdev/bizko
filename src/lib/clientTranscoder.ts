import { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_BASE = `/ffmpeg`;

let ffmpegPromise: Promise<FFmpeg> | null = null;

function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => console.debug("[ffmpeg]", message));
      await ffmpeg.load({
        coreURL: `${CORE_BASE}/ffmpeg-core.js`,
        wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
      });
      return ffmpeg;
    })().catch((err) => {
      ffmpegPromise = null;
      throw err;
    });
  }
  return ffmpegPromise;
}

export const TRANSCODE_CONFIG = {
  maxWidth: 1920,
  videoBitrate: "3500k",
  audioBitrate: "128k",
  preset: "ultrafast",
};

export async function compressVideo(
  file: Blob,
  {
    maxWidth = TRANSCODE_CONFIG.maxWidth,
    videoBitrate = TRANSCODE_CONFIG.videoBitrate,
  }: { maxWidth?: number; videoBitrate?: string } = {},
): Promise<Blob> {
  try {
    const inName = "input" + (file.type.includes("webm") ? ".webm" : ".mp4");
    const outName = "output.mp4";
    const ffmpeg = await getFFmpeg();
    await ffmpeg.writeFile(
      inName,
      new Uint8Array(await file.arrayBuffer()),
    );
    try {
      const exitCode = await ffmpeg.exec([
        "-i",
        inName,
        "-vf",
        `scale='min(${maxWidth},iw)':-2`,
        "-c:v",
        "libx264",
        "-preset",
        TRANSCODE_CONFIG.preset,
        "-b:v",
        videoBitrate,
        "-c:a",
        "aac",
        "-b:a",
        TRANSCODE_CONFIG.audioBitrate,
        "-movflags",
        "+faststart",
        outName,
      ]);
      if (exitCode !== 0) {
        throw new Error(`ffmpeg exited with code ${exitCode}`);
      }
      const raw = (await ffmpeg.readFile(outName)) as Uint8Array;
      const out = new Uint8Array(raw);
      return new Blob([out], { type: "video/mp4" });
    } finally {
      await ffmpeg.deleteFile(inName);
      await ffmpeg.deleteFile(outName);
    }
  } catch (err) {
    console.warn("Video compression failed, uploading original:", err);
    return file;
  }
}
