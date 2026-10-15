import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function getClaims() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  return data?.claims || null;
}

export async function updateSession(request: NextRequest) {
  console.log("[PROXY] pathname:", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data, error } = await supabase.auth.getClaims();

  console.log("[PROXY] getClaims:", {
    hasData: !!data,
    hasClaims: !!data?.claims,
    sub: data?.claims?.sub,
    error: error?.message,
  });

  // JWT timestamp diagnostics
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      const accessToken = sessionData.session.access_token;
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const iat = payload.iat;
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      console.log("[JWT DIAGNOSTIC PROXY]", {
        iat,
        exp,
        now,
        secondsUntilExpiry: exp - now,
        secondsSinceIssued: now - iat,
        timezone: process.env.TZ,
        isoTime: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.log("[JWT DIAGNOSTIC PROXY] Failed to decode access token:", e.message);
  }

  const user = data?.claims;

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/auth/callback") &&
    !request.nextUrl.pathname.startsWith("/pending-approval") &&
    !request.nextUrl.pathname.startsWith("/account-disabled") &&
    !request.nextUrl.pathname.startsWith("/forgot-password")
  ) {
    console.log("[PROXY REDIRECT]", {
      from: request.nextUrl.pathname,
      to: "/login",
      hasUser: !!user,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  console.log("[PROXY PASS]", {
    pathname: request.nextUrl.pathname,
    hasUser: !!user,
  });

  return supabaseResponse;
}
