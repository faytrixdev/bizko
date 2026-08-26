import Link from "next/link";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 mx-auto">
          <span className="font-bold font-display text-gray-900 text-lg">
            Bizko<span className="text-[#FF6B35]">.</span>
          </span>
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-bold tracking-tight font-display text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
