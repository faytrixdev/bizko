import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // On ne bloque QUE /api/ ici.
        //
        // Toutes les pages hors index (login, signup, forgot-password,
        // reset-password, verify-email, dashboard, onboarding, admin, account)
        // declarent "noindex" en metadata et restent donc CRAWLABLES.
        // C'est deliberé : combiner "Disallow" + noindex empeche Googlebot de
        // voir le noindex, et l'URL reste alors piegee en "Detectee, non
        // indexee" dans Search Console.
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://bizko.pro/sitemap.xml",
  };
}
