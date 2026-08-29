"use client";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/provider";

export function QrShare({ url }: { url: string }) {
  const { t } = useI18n();
  const [qr, setQr] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [hasShare] = useState(() => typeof navigator !== "undefined" && !!navigator.share);

  useEffect(() => {
    if (open) {
      import("qrcode").then(({ default: QRCode }) =>
        QRCode.toDataURL(url, { width: 400, margin: 2 }).then(setQr),
      );
    }
  }, [open, url]);

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => setOpen(!open)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">{open ? t("qr.close") : t("qr.generate")}</button>
      {hasShare && <button onClick={() => navigator.share({ title: t("qr.myBizko"), url })} className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">{t("qr.share")}</button>}
      {open && qr && (
        <div className="w-full mt-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR" className="h-64 w-64" />
          <a href={qr} download="bizko-qr.png" className="text-sm text-slate-900 underline">{t("qr.download")}</a>
          <p className="text-xs text-slate-500 text-center break-all">{url}</p>
        </div>
      )}
    </div>
  );
}
