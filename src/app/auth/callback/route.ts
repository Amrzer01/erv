import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const isSignup = requestUrl.searchParams.get("signup") === "true";

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const response = NextResponse.redirect(new URL("/dashboard/clients", requestUrl.origin));

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("[CALLBACK RESULT]", {
    hasSession: !!data?.session,
    hasUser: !!data?.user,
    error: error?.message,
  });

  // JWT timestamp diagnostics
  if (data?.session?.access_token) {
    try {
      const accessToken = data.session.access_token;
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const iat = payload.iat;
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      console.log("[JWT DIAGNOSTIC CALLBACK]", {
        iat,
        exp,
        now,
        secondsUntilExpiry: exp - now,
        secondsSinceIssued: now - iat,
        timezone: process.env.TZ,
        isoTime: new Date().toISOString(),
      });
    } catch (e) {
      console.log("[JWT DIAGNOSTIC CALLBACK] Failed to decode access token:", e.message);
    }
  }

  if (error || !data.session || !data.user) {
    const loginUrl = new URL(
      `/login?error=${encodeURIComponent(error?.message ?? "Authentication failed")}`,
      requestUrl.origin,
    );
    console.log("[CALLBACK ERROR LOCATION]", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Employee lookup
  const { data: existingEmployee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (employeeError) {
    console.error("Error fetching employee in callback:", employeeError);
  }

  const { count } = await supabase.from("employees").select("*", { count: "exact", head: true });
  const isFirstUser = count === 0;

  if (!existingEmployee) {
    const fullName = data.user.user_metadata.full_name || data.user.user_metadata.name || "مستخدم";
    const email = data.user.email;

    const { error: insertError } = await supabase.from("employees").insert({
      auth_user_id: data.user.id,
      full_name: fullName,
      email: email,
      avatar_url: data.user.user_metadata.avatar_url || data.user.user_metadata.picture || null,
      status: isFirstUser ? "active" : "pending",
      is_super_admin: isFirstUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error creating employee in callback:", insertError);
    }
  } else if (isFirstUser && !existingEmployee.is_super_admin) {
    await supabase
      .from("employees")
      .update({ status: "active", is_super_admin: true })
      .eq("auth_user_id", data.user.id);
  }

  const { data: updatedEmployee } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  let redirectUrl = new URL("/dashboard/clients", requestUrl.origin);

  if (updatedEmployee?.status === "pending") {
    redirectUrl = new URL("/pending-approval", requestUrl.origin);
  }

  if (updatedEmployee?.status === "inactive" || updatedEmployee?.status === "disabled") {
    redirectUrl = new URL("/account-disabled", requestUrl.origin);
  }

  // Update the redirect destination if needed
  if (redirectUrl.href !== new URL("/dashboard/clients", requestUrl.origin).href) {
    const finalResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value);
    });
    console.log("[CALLBACK FINAL LOCATION]", redirectUrl.toString());
    return finalResponse;
  }

  console.log("[CALLBACK FINAL LOCATION]", redirectUrl.toString());
  return response;
}
