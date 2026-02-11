import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Demo mode — no real Supabase configured, allow all routes through
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/about", "/features", "/pricing", "/api/"];
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
    );

    if (
      !user &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !isPublicRoute
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Don't redirect away from auth pages - let users switch accounts
    // The login page will clear the session if needed

    return supabaseResponse;
  } catch {
    // If Supabase fails (e.g. network error), allow the request through
    return NextResponse.next({ request });
  }
}
