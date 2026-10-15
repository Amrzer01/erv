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

export async function getDepartments() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getDepartmentById(departmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("departments").select("*").eq("id", departmentId).single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function createDepartment(name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("departments").insert({ name }).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "create_department", "departments", data.id, { department_name: name });
  }

  revalidatePath("/dashboard/departments");
  return { success: true, data };
}

export async function updateDepartment(departmentId: string, newName: string) {
  const supabase = await createClient();

  // First, get the current department name
  const { data: currentDept } = await supabase.from("departments").select("name").eq("id", departmentId).single();

  if (!currentDept) {
    return { success: false, error: "Department not found" };
  }

  const oldName = currentDept.name;

  // Check if any employees have this department
  const { data: employeesWithDept } = await supabase.from("employees").select("id").eq("department", oldName);

  const hasEmployees = employeesWithDept && employeesWithDept.length > 0;

  // Update employees with the old department name to the new name
  if (hasEmployees) {
    const { error: employeeUpdateError } = await supabase
      .from("employees")
      .update({ department: newName })
      .eq("department", oldName);

    if (employeeUpdateError) {
      return { success: false, error: `Failed to update employees: ${employeeUpdateError.message}` };
    }
  }

  // Update the department name
  const { error } = await supabase.from("departments").update({ name: newName }).eq("id", departmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "update_department", "departments", departmentId, {
      old_name: oldName,
      new_name: newName,
      employees_updated: hasEmployees ? employeesWithDept.length : 0,
    });
  }

  revalidatePath("/dashboard/departments");
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteDepartment(departmentId: string) {
  const supabase = await createClient();

  // Get the department name first
  const { data: department } = await supabase.from("departments").select("name").eq("id", departmentId).single();

  if (!department) {
    return { success: false, error: "Department not found" };
  }

  // Check if any employees have this department
  const { data: employeesWithDept } = await supabase.from("employees").select("id").eq("department", department.name);

  if (employeesWithDept && employeesWithDept.length > 0) {
    return {
      success: false,
      error: "لا يمكن حذف هذا القسم لأنه مرتبط بموظفين.",
    };
  }

  // Delete the department
  const { error } = await supabase.from("departments").delete().eq("id", departmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  const actorId = await getCurrentEmployeeId();
  if (actorId) {
    await logActivity(actorId, "delete_department", "departments", departmentId, {
      department_name: department.name,
    });
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}

export async function initializeDepartmentsFromExisting() {
  const supabase = await createClient();

  // Get existing distinct department names from employees
  const { data: existingDepartments } = await supabase
    .from("employees")
    .select("department")
    .not("department", "is", null);

  if (!existingDepartments || existingDepartments.length === 0) {
    return { success: true, message: "No existing departments found" };
  }

  // Get unique department names
  const uniqueNames = Array.from(new Set(existingDepartments.map((e) => e.department).filter(Boolean)));

  // Get current departments in the departments table
  const { data: currentDepartments } = await supabase.from("departments").select("name");

  const currentNames = new Set(currentDepartments?.map((d) => d.name) || []);

  // Add missing departments
  const departmentsToAdd = uniqueNames.filter((name) => !currentNames.has(name));

  if (departmentsToAdd.length === 0) {
    return { success: true, message: "All departments already exist" };
  }

  const { error } = await supabase.from("departments").insert(departmentsToAdd.map((name) => ({ name })));

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: `Added ${departmentsToAdd.length} departments from existing employee data`,
  };
}
