"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { useI18n } from "@/lib/i18n/provider";

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
  const supabase = createClient();
  const router = useRouter();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const { error: insertErr } = await supabase.from("portfolio_items").insert({ profile_id: profileId, image_url: data.publicUrl, position: nextPos });
      if (insertErr) {
        // Avoid orphaned storage object on DB failure.
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

  return (
    <label className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-700">
      {uploading ? "Upload..." : t("upload.addImage")}
      <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
    </label>
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

