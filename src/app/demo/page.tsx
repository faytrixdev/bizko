import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { DemoClient } from "./DemoClient";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.demo?.title ?? "Démo Bizko — Aperçu des templates",
    description:
      msg.demo?.description ??
      "Découvrez les templates Bizko : minimal, portfolio, édito, urban. Testez l'affichage de vos services, prix et portfolio avant de créer votre profil.",
    alternates: {
      canonical: "https://bizko.pro/demo",
    },
    openGraph: {
      title: msg.demo?.title ?? "Démo Bizko — Aperçu des templates",
      description:
        msg.demo?.description ??
        "Découvrez les templates Bizko : minimal, portfolio, édito, urban. Testez l'affichage de vos services, prix et portfolio avant de créer votre profil.",
      url: "https://bizko.pro/demo",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: msg.demo?.title ?? "Démo Bizko",
      description:
        msg.demo?.description ?? "Aperçu des templates Bizko pour indépendants.",
    },
  };
}

export default function DemoPage() {
  return <DemoClient />;
}