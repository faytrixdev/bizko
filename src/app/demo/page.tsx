import type { Metadata } from "next";
import DemoClient from "./DemoClient";

const TITLE = "Démo Bizko — Aperçu des templates";
const DESCRIPTION =
  "Découvrez les templates Bizko : minimal, portfolio, édito, urban. Testez l'affichage de vos services, vos prix et votre portfolio avant de créer votre page.";
const CANONICAL = "https://bizko.pro/demo";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
