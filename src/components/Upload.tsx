"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import imageCompression from "browser-image-compression";

export function AvatarUpload({ profileId, currentUrl }: { profileId: string; currentUrl?: string | null }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 800, useWebWorker: true });
      const path = `${profileId}/avatar-${Date.now()}.webp`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, compressed, { upsert: true, contentType: "image/webp" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profileId);
      location.reload();
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
        {uploading ? "Upload..." : "Changer avatar"}
        <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
      </label>
    </div>
  );
}

export function PortfolioUpload({ profileId }: { profileId: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true });
      const path = `${profileId}/${Date.now()}-${file.name.replace(/\s/g, "-")}.webp`;
      const { error: upErr } = await supabase.storage.from("portfolio").upload(path, compressed, { contentType: "image/webp" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const { data: existing } = await supabase.from("portfolio_items").select("position").eq("profile_id", profileId).order("position", { ascending: false }).limit(1);
      const nextPos = existing && existing[0] ? existing[0].position + 1 : 0;
      await supabase.from("portfolio_items").insert({ profile_id: profileId, image_url: data.publicUrl, position: nextPos });
      location.reload();
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-700">
      {uploading ? "Upload..." : "+ Ajouter image"}
      <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
    </label>
  );
}
