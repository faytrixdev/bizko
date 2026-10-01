import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  images: {
    // Next 16 requires every quality to be allow-listed; the default is [75].
    // Grids serve q75, and the lightbox serves q90 for photos the user chose to
    // open full-screen, so both must be declared or the optimizer 400s.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "media.bizko.pro",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // Page removed: the duplicate pricing page drifted out of sync with
      // /pricing (annual price, mobile money, free-tier limits). The permanent
      // redirect (308) keeps the link equity instead of serving a 404 on an
      // indexed URL.
      { source: "/pricing-africa", destination: "/pricing", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://media.bizko.pro https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com",
              "media-src 'self' blob: https://media.bizko.pro",
              "worker-src 'self' blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.r2.cloudflarestorage.com https://www.google-analytics.com https://www.google.com https://cdn.jsdelivr.net https://vercel.live",
              "frame-src https://*.supabase.co",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter", "remark-gfm"],
  },
});

export default withMDX(nextConfig);
