"use client";

import { useEffect, useState } from "react";

import { Plus, Search, Settings, Shield, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { approveEmployee, disableEmployee, getEmployees, reactivateEmployee } from "../_actions/employees";
import { getRoles } from "../_actions/roles";
import { EmployeeDrawer } from "./employee-drawer";
import { PermissionsTab } from "./permissions-tab";
import { RolesTab } from "./roles-tab";

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
}

export function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [employeesResult, rolesResult] = await Promise.all([getEmployees(), getRoles()]);

    if (employeesResult.success && employeesResult.data) {
      setEmployees(employeesResult.data);
    }

    if (rolesResult.success && rolesResult.data) {
      setRoles(rolesResult.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (employeeId: string) => {
    const result = await approveEmployee(employeeId);
    if (result.success) {
      toast.success("تم تفعيل حساب الموظف بنجاح");
      loadData();
    } else {
      toast.error("تعذر تفعيل الحساب");
    }
  };

  const handleDisable = async (employeeId: string) => {
    const result = await disableEmployee(employeeId);
    if (result.success) {
      toast.success("تم تعطيل الحساب");
      loadData();
    } else {
      toast.error("تعذر تعطيل الحساب");
    }
  };

  const handleReactivate = async (employeeId: string) => {
    const result = await reactivateEmployee(employeeId);
    if (result.success) {
      toast.success("تم إعادة تفعيل الحساب");
      loadData();
    } else {
      toast.error("تعذر إعادة تفعيل الحساب");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (employee.phone?.includes(searchQuery) ?? false);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.status === "active") ||
      (statusFilter === "pending" && employee.status === "pending") ||
      (statusFilter === "inactive" && (employee.status === "inactive" || employee.status === "disabled"));

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    pending: employees.filter((e) => e.status === "pending").length,
    inactive: employees.filter((e) => e.status === "inactive" || e.status === "disabled").length,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المستخدمون</h1>
        <p className="text-muted-foreground mt-2">إدارة الموظفين وحسابات الوصول والصلاحيات داخل النظام</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الموظفون النشطون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">بانتظار الموافقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الحسابات المعطلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="employees">الموظفون</TabsTrigger>
            <TabsTrigger value="roles">الأدوار</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          </TabsList>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف
          </Button>
        </div>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن موظف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="pending">بانتظار الموافقة</option>
                    <option value="inactive">معطل</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="w-full overflow-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr className="text-right">
                      <th className="px-4 py-3 text-sm font-medium">الموظف</th>
                      <th className="px-4 py-3 text-sm font-medium">القسم</th>
                      <th className="px-4 py-3 text-sm font-medium">الدور</th>
                      <th className="px-4 py-3 text-sm font-medium">الحالة</th>
                      <th className="px-4 py-3 text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          لا يوجد موظفون
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {employee.full_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{employee.full_name}</div>
                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                                {employee.is_super_admin && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    <Shield className="ml-1 h-3 w-3" />
                                    مدير النظام
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{employee.department || "غير محدد"}</td>
                          <td className="px-4 py-3 text-sm">{employee.role || "-"}</td>
                          <td className="px-4 py-3">{getStatusBadge(employee.status)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setDrawerOpen(true);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              {employee.status === "pending" && (
                                <Button variant="ghost" size="sm" onClick={() => handleApprove(employee.id)}>
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {employee.status === "active" && !employee.is_super_admin && (
                                <Button variant="ghost" size="sm" onClick={() => handleDisable(employee.id)}>
                                  <UserX className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                              {employee.status === "inactive" && (
                                <Button variant="ghost" size="sm" onClick={() => handleReactivate(employee.id)}>
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab roles={roles} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
      </Tabs>

      <EmployeeDrawer employee={selectedEmployee} open={drawerOpen} onOpenChange={setDrawerOpen} onRefresh={loadData} />
    </div>
  );
}
