import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = new URL(request.url);
  const pathname = url.pathname;
  const code = url.searchParams.get("code");

  // Forward any auth code (e.g. email confirmation) landing outside /auth/callback.
  // /reset-password handles its own recovery code (exchanged on the page itself),
  // so it must NOT be intercepted here, otherwise the reset flow breaks.
  if (
    code &&
    pathname !== "/auth/callback" &&
    pathname !== "/reset-password"
  ) {
    return NextResponse.redirect(
      new URL(`/auth/callback?code=${encodeURIComponent(code)}`, request.url)
    );
  }

  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth/callback",
  ];
  const publicApiRoutes = [
    "/api/check-username",
    "/api/track-click",
    "/api/supabase-health",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApi = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Réservé à l'app : routes qui ne sont PAS des profils publics à la racine
  const reservedRootPrefixes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth",
    "/api",
    "/legal",
    "/dashboard",
    "/account",
    "/onboarding",
    "/demo",
  ];
  // Un profil public est servi à la racine sur un seul segment : /<username>
  const isRootPublicProfile =
    pathname !== "/" &&
    !pathname.includes("/", 1) &&
    !reservedRootPrefixes.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // Public profile pages and public API routes don't need the session:
  // skip getUser() entirely (avoids an auth round-trip per request).
  if (isPublicApi || isRootPublicProfile) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (isPublicRoute || pathname === "/" || pathname === "/demo") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname === "/onboarding") {
      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/account")
    ) {
      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  } else {
    if (
      !isPublicRoute &&
      !isRootPublicProfile &&
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/legal") &&
      pathname !== "/" &&
      pathname !== "/demo"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}
