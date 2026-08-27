"use client";
import { useState, useEffect } from "react";
import QRCode from "qrcode";

export function QrShare({ url }: { url: string }) {
  const [qr, setQr] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [hasShare, setHasShare] = useState(false);

  useEffect(() => {
    setHasShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (open) QRCode.toDataURL(url, { width: 400, margin: 2 }).then(setQr);
  }, [open, url]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    alert("Lien copié !");
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={copy} className="h-9 px-4 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">Copier le lien</button>
      <button onClick={() => setOpen(!open)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">{open ? "Fermer QR" : "Generer QR"}</button>
      {hasShare && <button onClick={() => navigator.share({ title: "Mon Bizko", url })} className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Partager</button>}
      {open && qr && (
        <div className="w-full mt-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" className="h-64 w-64" />
          <a href={qr} download="bizko-qr.png" className="text-sm text-slate-900 underline">Télécharger PNG</a>
          <p className="text-xs text-slate-500 text-center break-all">{url}</p>
        </div>
      )}
    </div>
  );
}
