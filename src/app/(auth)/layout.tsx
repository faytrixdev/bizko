import type { Metadata } from "next";
import { Suspense } from "react";

// noindex, follow : Google doit pouvoir crawler la page pour VOIR ce noindex.
// Ne jamais combiner "Disallow" dans robots.txt + noindex ici, sinon Googlebot
// ne fetch pas la page, ne voit pas le noindex, et l'URL reste indefinitely
// en "Detectee, non indexee" dans Search Console.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
