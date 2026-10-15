"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getCurrentEmployeeId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  if (!user) return null;

  const { data: employee } = await supabase.from("employees").select("id").eq("auth_user_id", user.sub).maybeSingle();

  return employee?.id || null;
}

async function logActivity(
  employeeId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, any>,
) {
  const supabase = await createClient();
  const actorId = await getCurrentEmployeeId();

  await supabase.from("employee_activity_logs").insert({
    employee_id: employeeId,
    action,
    entity,
    entity_id: entityId,
    details: details || null,
  });
}

export async function approveEmployee(employeeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "approve_employee", "employees", employeeId);

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function disableEmployee(employeeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "disable_employee", "employees", employeeId);

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function reactivateEmployee(employeeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "reactivate_employee", "employees", employeeId);

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getEmployees() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getEmployeeById(employeeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("employees").select("*").eq("id", employeeId).single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getEmployeeRoles(employeeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employee_roles")
    .select(`
      role_id,
      roles (
        id,
        name,
        description,
        color,
        is_system
      )
    `)
    .eq("employee_id", employeeId);

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getEmployeeEffectivePermissions(employeeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employee_roles")
    .select(`
      roles (
        role_permissions (
          permissions (
            id,
            permission_key,
            display_name,
            category,
            description
          )
        )
      )
    `)
    .eq("employee_id", employeeId);

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  // Flatten and deduplicate permissions
  const permissions = data
    ?.flatMap((er: any) => er.roles?.role_permissions?.map((rp: any) => rp.permissions) || [])
    .filter(Boolean);

  const uniquePermissions = Array.from(new Map(permissions?.map((p: any) => [p.permission_key, p]) || []).values());

  return { success: true, data: uniquePermissions, error: null };
}

export async function updateEmployeeDepartment(employeeId: string, department: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .update({
      department,
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "update_department", "employees", employeeId, { department });

  revalidatePath("/dashboard/users");
  return { success: true };
}
