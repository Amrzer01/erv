"use client";

import { useEffect, useState } from "react";

import { Briefcase, Building, Calendar, Mail, Phone, Shield, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { getDepartments } from "../../departments/_actions/departments";
import { useAuth } from "@/contexts/auth-context";
import {
  getEmployeeById,
  getEmployeeEffectivePermissions,
  getEmployeeRoles,
  updateEmployeeDepartment,
} from "../_actions/employees";
import { assignRoleToEmployee, getRoles, removeRoleFromEmployee } from "../_actions/roles";

interface Employee {
  id: string;
  auth_user_id: string | null;
  employee_code: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  role: string;
  status: "active" | "pending" | "inactive" | "disabled";
  is_super_admin: boolean;
  last_login: string | null;
  created_at: string;
  hired_at?: string | null;
}

interface EmployeeDrawerProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function EmployeeDrawer({ employee, open, onOpenChange, onRefresh }: EmployeeDrawerProps) {
  const [employeeRoles, setEmployeeRoles] = useState<any[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { refreshEmployee, currentUser } = useAuth();

  useEffect(() => {
    if (employee && open) {
      loadEmployeeData();
    }
  }, [employee, open]);

  const loadEmployeeData = async () => {
    if (!employee) return;

    setLoading(true);
    const [rolesResult, permissionsResult, allRolesResult, departmentsResult] = await Promise.all([
      getEmployeeRoles(employee.id),
      getEmployeeEffectivePermissions(employee.id),
      getRoles(),
      getDepartments(),
    ]);

    if (rolesResult.success && rolesResult.data) {
      setEmployeeRoles(rolesResult.data);
    }

    if (permissionsResult.success && permissionsResult.data) {
      setEffectivePermissions(permissionsResult.data);
    }

    if (allRolesResult.success && allRolesResult.data) {
      const assignedRoleIds = rolesResult.data?.map((r: any) => r.role_id) || [];
      setAvailableRoles(allRolesResult.data.filter((r: any) => !assignedRoleIds.includes(r.id)));
    }

    if (departmentsResult.success && departmentsResult.data) {
      setDepartments(departmentsResult.data);
    }

    setSelectedDepartment(employee.department || "");

    setLoading(false);
  };

  const handleAssignRole = async (roleId: string) => {
    if (!employee) return;

    const result = await assignRoleToEmployee(employee.id, roleId);
    if (result.success) {
      toast.success("تم تحديث أدوار الموظف");
      loadEmployeeData();
      onRefresh();
    } else {
      toast.error("تعذر تحديث الأدوار");
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!employee) return;

    const result = await removeRoleFromEmployee(employee.id, roleId);
    if (result.success) {
      toast.success("تم تحديث أدوار الموظف");
      loadEmployeeData();
      onRefresh();
    } else {
      toast.error("تعذر تحديث الأدوار");
    }
  };

  const handleDepartmentChange = async (newDepartment: string) => {
    if (!employee) return;

    const departmentValue = newDepartment === "none" ? null : newDepartment;
    const result = await updateEmployeeDepartment(employee.id, departmentValue);

    if (result.success) {
      toast.success("تم تحديث القسم بنجاح");
      setSelectedDepartment(departmentValue || "");
      onRefresh();
      // Refresh auth context to update the account switcher if updating current user
      if (employee.auth_user_id === currentUser?.id) {
        refreshEmployee();
      }
    } else {
      toast.error("تعذر تحديث القسم");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">نشط</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">بانتظار الموافقة</Badge>;
      case "inactive":
      case "disabled":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">معطل</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const groupedPermissions = effectivePermissions.reduce(
    (acc: Record<string, any[]>, perm: any) => {
      const category = perm.category || "عام";
      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  if (!employee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px]" dir="rtl">
        <SheetHeader>
          <SheetTitle>تفاصيل الموظف</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.avatar_url || undefined} />
                <AvatarFallback className="text-lg">{employee.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{employee.full_name}</h3>
                  {employee.is_super_admin && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="ml-1 h-3 w-3" />
                      مدير النظام
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
                <div className="mt-2">{getStatusBadge(employee.status)}</div>
              </div>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">المعلومات الأساسية</h4>
              <div className="grid gap-3 text-sm">
                {employee.employee_code && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">كود الموظف:</span>
                    <span>{employee.employee_code}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span dir="ltr">{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الإدارة:</span>
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange} disabled={loading}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder="غير محدد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">غير محدد</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {employee.job_title && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">المسمى الوظيفي:</span>
                    <span>{employee.job_title}</span>
                  </div>
                )}
                {employee.last_login && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">آخر تسجيل دخول:</span>
                    <span>{new Date(employee.last_login).toLocaleString("ar-EG")}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">الأدوار</h4>
                {availableRoles.length > 0 && (
                  <select
                    onChange={(e) => e.target.value && handleAssignRole(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                    defaultValue=""
                  >
                    <option value="">+ إضافة دور</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {loading ? (
                <div className="text-sm text-muted-foreground">جاري التحميل...</div>
              ) : employeeRoles.length === 0 ? (
                <div className="text-sm text-muted-foreground">لا توجد أدوار مسندة</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {employeeRoles.map((er: any) => (
                    <Badge
                      key={er.role_id}
                      variant="outline"
                      className="gap-1"
                      style={{ borderColor: er.roles?.color }}
                    >
                      {er.roles?.name}
                      <button onClick={() => handleRemoveRole(er.role_id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Effective Permissions */}
            <div className="space-y-4">
              <h4 className="font-semibold">الصلاحيات الفعلية</h4>

              {loading ? (
                <div className="text-sm text-muted-foreground">جاري التحميل...</div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-sm text-muted-foreground">لا توجد صلاحيات</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]: [string, any[]]) => (
                    <div key={category}>
                      <h5 className="mb-2 font-medium text-sm">{category}</h5>
                      <div className="space-y-1">
                        {perms.map((perm: any) => (
                          <div key={perm.id} className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">✓</span>
                            <span>{perm.display_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
