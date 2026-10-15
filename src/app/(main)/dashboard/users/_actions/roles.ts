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

export async function assignRoleToEmployee(employeeId: string, roleId: string) {
  const supabase = await createClient();

  // Check if assignment already exists
  const { data: existing } = await supabase
    .from("employee_roles")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("role_id", roleId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Role already assigned" };
  }

  const { error } = await supabase.from("employee_roles").insert({ employee_id: employeeId, role_id: roleId });

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "assign_role", "employee_roles", `${employeeId}-${roleId}`, { role_id: roleId });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function removeRoleFromEmployee(employeeId: string, roleId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("employee_roles").delete().eq("employee_id", employeeId).eq("role_id", roleId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity(employeeId, "remove_role", "employee_roles", `${employeeId}-${roleId}`, { role_id: roleId });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getRoles() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("roles").select("*").order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function createRole(data: {
  name: string;
  description?: string;
  color?: string;
  permissionIds?: string[];
}) {
  const supabase = await createClient();

  // Create role
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .insert({
      name: data.name,
      description: data.description || null,
      color: data.color || "#3b82f6",
    })
    .select()
    .single();

  if (roleError) {
    return { success: false, error: roleError.message };
  }

  // Assign permissions if provided
  if (data.permissionIds && data.permissionIds.length > 0) {
    const rolePermissions = data.permissionIds.map((permissionId) => ({
      role_id: role.id,
      permission_id: permissionId,
    }));

    const { error: permissionsError } = await supabase.from("role_permissions").insert(rolePermissions);

    if (permissionsError) {
      // Rollback role creation if permission assignment fails
      await supabase.from("roles").delete().eq("id", role.id);
      return { success: false, error: permissionsError.message };
    }
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "create_role", "roles", role.id, { role_name: data.name });
  }

  revalidatePath("/dashboard/users");
  return { success: true, data: role };
}

export async function updateRole(
  roleId: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    permissionIds?: string[];
  },
) {
  const supabase = await createClient();

  // Update role basic info
  const { error: updateError } = await supabase
    .from("roles")
    .update({
      name: data.name,
      description: data.description,
      color: data.color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roleId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Update permissions if provided
  if (data.permissionIds !== undefined) {
    // Delete existing permissions
    await supabase.from("role_permissions").delete().eq("role_id", roleId);

    // Insert new permissions
    if (data.permissionIds.length > 0) {
      const rolePermissions = data.permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      const { error: permissionsError } = await supabase.from("role_permissions").insert(rolePermissions);

      if (permissionsError) {
        return { success: false, error: permissionsError.message };
      }
    }
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "update_role", "roles", roleId, { role_name: data.name });
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient();

  // Check if role is system role
  const { data: role } = await supabase.from("roles").select("is_system, name").eq("id", roleId).single();

  if (role?.is_system) {
    return { success: false, error: "Cannot delete system roles" };
  }

  // Check if role is assigned to employees
  const { count } = await supabase
    .from("employee_roles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (count && count > 0) {
    return {
      success: false,
      error: "Cannot delete role assigned to employees",
    };
  }

  // Delete role permissions first
  await supabase.from("role_permissions").delete().eq("role_id", roleId);

  // Delete role
  const { error } = await supabase.from("roles").delete().eq("id", roleId);

  if (error) {
    return { success: false, error: error.message };
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "delete_role", "roles", roleId, { role_name: role?.name });
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getPermissions() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("permissions").select("*").order("category", { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getRolePermissions(roleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_permissions")
    .select(`
      permission_id,
      permissions (
        id,
        permission_key,
        display_name,
        category,
        description
      )
    `)
    .eq("role_id", roleId);

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}
