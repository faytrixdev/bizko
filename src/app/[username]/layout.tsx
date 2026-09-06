import type { ReactNode } from "react";
import { Archivo_Narrow, EB_Garamond, Sora } from "next/font/google";

const archivo = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600"],
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

export default function UsernameLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${archivo.variable} ${garamond.variable} ${sora.variable}`}>
      {children}
    </div>
  );
}