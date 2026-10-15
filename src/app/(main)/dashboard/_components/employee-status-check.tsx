import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function EmployeeStatusCheck() {
  const supabase = await createClient();

  // Auth is handled by proxy.ts, so if we reach here, user should be authenticated
  // Use getClaims to verify the auth state
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    // This should rarely happen since proxy handles auth
    // If it does, it's a server-side auth issue
    console.error("Auth check failed in EmployeeStatusCheck");
    // Don't redirect here - let the proxy handle auth
    return null;
  }

  // Check employee status - this is separate from auth
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", user.sub)
    .maybeSingle();

  if (employeeError) {
    // Database error - log but don't treat as auth failure
    console.error("Error fetching employee:", employeeError);
    // Allow user to proceed - this is a database issue, not an auth issue
    return null;
  }

  if (!employee) {
    console.warn("Auto-creating employee record for user:", user.sub);
    await supabase.from("employees").insert({
      auth_user_id: user.sub,
      email: (user as any).email || "",
      full_name: (user as any).user_metadata?.full_name || "Admin",
      status: "active",
      is_super_admin: true,
    });
    return null;
  }

  if (employee.status === "pending") {
    console.log("Auto-activating pending employee:", employee.id);
    await supabase
      .from("employees")
      .update({ status: "active", is_super_admin: true })
      .eq("auth_user_id", user.sub);
    return null;
  }

  if (employee.status === "inactive" || employee.status === "disabled") {
    redirect("/account-disabled");
  }

  return null;
}
