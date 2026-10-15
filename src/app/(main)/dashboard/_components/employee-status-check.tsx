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
    // Employee record doesn't exist - this is a data issue, not auth failure
    // Log the issue but don't log the user out
    console.warn("Employee record not found for user:", user.sub);
    // For now, redirect to a page that handles this case
    // In a real app, you might want to create the employee record or show an error
    redirect("/pending-approval");
  }

  if (employee.status === "pending") {
    redirect("/pending-approval");
  }

  if (employee.status === "inactive" || employee.status === "disabled") {
    redirect("/account-disabled");
  }

  return null;
}
