"use client";
import { createClient } from "@/lib/supabase/client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { useI18n } from "@/lib/i18n/provider";
import { validateVideoFile, validateVideoDuration } from "@/lib/portfolioVideo";

export function AvatarUpload({ profileId, currentUrl }: { profileId: string; currentUrl?: string | null }) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const oldUrl = currentUrl;
      const squared = await cropToSquare(file);
      const compressed = await imageCompression(squared, { maxSizeMB: 0.3, maxWidthOrHeight: 800, useWebWorker: true });
      const path = `${profileId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, compressed, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profileId);
      if (dbErr) throw dbErr;
      router.refresh();
      // Best-effort: remove the previous avatar from storage to avoid orphans.
      if (oldUrl) {
        try {
          const base = supabase.storage.from("avatars").getPublicUrl("").data.publicUrl.replace(/\/$/, "");
          if (oldUrl.startsWith(base)) {
            await supabase.storage.from("avatars").remove([oldUrl.slice(base.length + 1)]);
          }
        } catch { /* ignore cleanup failure */ }
      }
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {currentUrl ? <img src={currentUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover border border-gray-200" /> : <div className="h-12 w-12 rounded-full bg-gray-100" />}
      <label className="text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700">
        {uploading ? "Upload..." : t("upload.changeAvatar")}
        <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
      </label>
    </div>
  );
}

export function PortfolioUpload({ profileId }: { profileId: string }) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true, fileType: "image/webp" });
      const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
      const path = `${profileId}/${Date.now()}-${safeName}.webp`;
      const { error: upErr } = await supabase.storage.from("portfolio").upload(path, compressed, { contentType: "image/webp" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const { data: existing } = await supabase.from("portfolio_items").select("position").eq("profile_id", profileId).order("position", { ascending: false }).limit(1);
      const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;
      const { error: insertErr } = await supabase.from("portfolio_items").insert({ profile_id: profileId, media_url: data.publicUrl, media_type: "image", thumbnail_url: null, position: nextPos });
      if (insertErr) {
        await supabase.storage.from("portfolio").remove([path]);
        throw insertErr;
      }
      router.refresh();
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  };

  const pendingVideoRef = useRef<File | null>(null);

  const onVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateVideoFile(file);
    if (err) { alert(t("upload." + err)); return; }
    try {
      const duration = await getVideoDuration(file);
      const durationErr = validateVideoDuration(duration);
      if (durationErr) { alert(t("upload." + durationErr)); return; }
    } catch {
      alert(t("upload.videoReadError"));
      return;
    }
    pendingVideoRef.current = file;
    thumbRef.current?.click();
  };

  const onThumbSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const thumbFile = e.target.files?.[0];
    e.target.value = "";
    const videoFile = pendingVideoRef.current;
    pendingVideoRef.current = null;
    if (!videoFile || !thumbFile) return;
    setUploading(true);
    const pathsToRemove: string[] = [];
    try {
      const safeName = videoFile.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
      const ts = Date.now();
      const videoPath = `${profileId}/${ts}-${safeName}${videoFile.name.slice(videoFile.name.lastIndexOf("."))}`;
      const { error: vErr } = await supabase.storage.from("portfolio").upload(videoPath, videoFile, { contentType: videoFile.type });
      if (vErr) throw vErr;
      pathsToRemove.push(videoPath);
      const { data: vData } = supabase.storage.from("portfolio").getPublicUrl(videoPath);

      const compressedThumb = await imageCompression(thumbFile, { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true, fileType: "image/webp" });
      const thumbPath = `${profileId}/${ts}-thumb.webp`;
      const { error: tErr } = await supabase.storage.from("portfolio").upload(thumbPath, compressedThumb, { contentType: "image/webp" });
      if (tErr) throw tErr;
      pathsToRemove.push(thumbPath);
      const { data: tData } = supabase.storage.from("portfolio").getPublicUrl(thumbPath);

      const { data: existing } = await supabase.from("portfolio_items").select("position").eq("profile_id", profileId).order("position", { ascending: false }).limit(1);
      const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;
      const { error: insertErr } = await supabase.from("portfolio_items").insert({ profile_id: profileId, media_url: vData.publicUrl, media_type: "video", thumbnail_url: tData.publicUrl, position: nextPos });
      if (insertErr) {
        await supabase.storage.from("portfolio").remove(pathsToRemove);
        throw insertErr;
      }
      router.refresh();
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => !uploading && setMenuOpen(!menuOpen)} className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-700 disabled:opacity-50" disabled={uploading}>
        {uploading ? "Upload..." : t("upload.addMedia")}
      </button>
      {menuOpen && (
        <div className="absolute left-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-sm">
          <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700" onClick={() => { setMenuOpen(false); imageRef.current?.click(); }}>{t("upload.imageType")}</button>
          <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700" onClick={() => { setMenuOpen(false); videoRef.current?.click(); }}>{t("upload.videoType")}</button>
        </div>
      )}
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadImage(f); }} />
      <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={onVideoSelect} />
      <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={onThumbSelect} />
    </div>
  );
}

async function cropToSquare(file: File): Promise<File> {
  // Charge l'image pour connaître ses dimensions
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image invalide"));
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté");

  // Fond blanc : élimine la transparence des PNG, le rond reste toujours plein
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Crop carré centré : le sujet occupe tout le rond
  ctx.drawImage(
    img,
    (img.naturalWidth - size) / 2,
    (img.naturalHeight - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size
  );

  // Sortie en JPEG : pas d'alpha, garantit un rond opaque
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible"))), "image/jpeg", 0.92)
  );
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadedmetadata = () => {
      if (video.duration === Infinity) {
        // Certains MP4 (fragmentés / optimisés pour le streaming) ne publient pas
        // leur durée dans les métadonnées : video.duration vaut alors Infinity.
        // On cherche vers une position très loin pour forcer le navigateur à
        // calculer la véritable durée.
        video.currentTime = 1e7;
        video.onseeked = () => {
          cleanup();
          resolve(video.duration);
        };
      } else {
        cleanup();
        resolve(video.duration);
      }
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Impossible de lire la video"));
    };
    video.src = url;
  });
}

