import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  const url = new URL(request.url);
  const pathname = url.pathname;

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

  if (isPublicApi) {
    return supabaseResponse;
  }

  if (user) {
    if (isPublicRoute) {
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
      !pathname.startsWith("/api/") &&
      pathname !== "/" &&
      !pathname.startsWith("/[username]") &&
      pathname !== "/demo"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}
