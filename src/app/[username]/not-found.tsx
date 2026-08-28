import Link from "next/link";
import { getServerMessages } from "@/lib/i18n/messages-server";

export default async function NotFound() {
  const t = await getServerMessages();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-bold tracking-tight font-display text-gray-900">{t.notFound.title}</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        {t.notFound.subtitle} <span className="font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">bizko.me/...</span>
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/signup" className="h-11 inline-flex items-center rounded-lg bg-[#FF6B35] px-6 text-white font-semibold hover:bg-[#EA580C]">{t.notFound.cta}</Link>
        <Link href="/" className="h-11 inline-flex items-center rounded-lg bg-white border border-gray-200 px-6 font-medium text-gray-700 hover:bg-gray-50">{t.notFound.home}</Link>
      </div>
    </div>
  );
}
