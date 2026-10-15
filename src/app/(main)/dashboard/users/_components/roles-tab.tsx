"use client";

import { useState } from "react";

import { Edit, Key, Plus, Shield, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createRole, deleteRole, getPermissions, getRolePermissions, updateRole } from "../_actions/roles";

interface Role {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_system: boolean | null;
}

interface RolesTabProps {
  roles: Role[];
  onRefresh: () => void;
}

const ROLE_PRE = [
  {
    name: "مدير النظام",
    description: "صلاحيات كاملة على النظام",
    color: "#ef4444",
    permissionKeys: [], // Will be filled with all available permissions
  },
  {
    name: "مدير المبيعات",
    description: "إدارة العملاء والمبيعات",
    color: "#3b82f6",
    permissionKeys: ["clients.view", "clients.create", "clients.edit", "clients.delete"],
  },
  {
    name: "المبيعات",
    description: "عرض وإدارة العملاء",
    color: "#10b981",
    permissionKeys: ["clients.view", "clients.create", "clients.edit"],
  },
  {
    name: "خدمة العملاء",
    description: "متابعة العملاء والطلبات",
    color: "#f59e0b",
    permissionKeys: ["clients.view", "followup.view", "followup.create"],
  },
  {
    name: "المحاسبة",
    description: "إدارة الحسابات والفواتير",
    color: "#8b5cf6",
    permissionKeys: ["finance.view", "invoice.view", "invoice.create"],
  },
  {
    name: "الموارد البشرية",
    description: "إدارة الموظفين",
    color: "#ec4899",
    permissionKeys: ["employees.view", "employees.edit"],
  },
  {
    name: "التسويق",
    description: "إدارة الحملات التسويقية",
    color: "#06b6d4",
    permissionKeys: ["marketing.view", "marketing.create"],
  },
  {
    name: "مشرف",
    description: "صلاحيات إدارية محدودة",
    color: "#6366f1",
    permissionKeys: ["clients.view", "employees.view"],
  },
];

export function RolesTab({ roles, onRefresh }: RolesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleColor, setRoleColor] = useState("#3b82f6");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPermissions = async () => {
    const result = await getPermissions();
    if (result.success && result.data) {
      setPermissions(result.data);
    }
  };

  const loadRolePermissions = async (roleId: string) => {
    const result = await getRolePermissions(roleId);
    if (result.success && result.data) {
      setSelectedPermissions(result.data.map((rp: any) => rp.permission_id));
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    const result = await createRole({
      name: roleName,
      description: roleDescription,
      color: roleColor,
      permissionIds: selectedPermissions,
    });

    if (result.success) {
      toast.success("تم إنشاء الدور بنجاح");
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } else {
      toast.error("تعذر إنشاء الدور");
    }
    setLoading(false);
  };

  const handleCreateFromPreset = async (preset: (typeof ROLE_PRE)[0]) => {
    setLoading(true);

    // Map permission keys to actual permission IDs
    const permissionIds = permissions.filter((p) => preset.permissionKeys.includes(p.permission_key)).map((p) => p.id);

    const result = await createRole({
      name: preset.name,
      description: preset.description,
      color: preset.color,
      permissionIds,
    });

    if (result.success) {
      toast.success("تم إنشاء الدور بنجاح");
      setPresetDialogOpen(false);
      onRefresh();
    } else {
      toast.error("تعذر إنشاء الدور");
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingRole) return;

    setLoading(true);
    const result = await updateRole(editingRole.id, {
      name: roleName,
      description: roleDescription,
      color: roleColor,
      permissionIds: selectedPermissions,
    });

    if (result.success) {
      toast.success("تم تحديث الدور");
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } else {
      toast.error("تعذر تحديث الدور");
    }
    setLoading(false);
  };

  const handleDelete = async (roleId: string) => {
    const result = await deleteRole(roleId);
    if (result.success) {
      toast.success("تم حذف الدور");
      onRefresh();
    } else {
      toast.error(result.error || "تعذر حذف الدور");
    }
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    resetForm();
    loadPermissions();
    setDialogOpen(true);
  };

  const openPresetDialog = () => {
    loadPermissions();
    setPresetDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRoleColor(role.color || "#3b82f6");
    loadPermissions();
    loadRolePermissions(role.id);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setRoleColor("#3b82f6");
    setSelectedPermissions([]);
  };

  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      const category = perm.category || "عام";
      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openPresetDialog}>
              <Sparkles className="ml-2 h-4 w-4" />
              إنشاء من قالب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء دور من قالب</DialogTitle>
              <DialogDescription>اختر قالباً لإنشاء دور جديد بسرعة</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {ROLE_PRE.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleCreateFromPreset(preset)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 text-right hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: preset.color }} />
                  <div className="flex-1">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-muted-foreground">{preset.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء دور
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? "تعديل الدور" : "إنشاء دور جديد"}</DialogTitle>
              <DialogDescription>
                {editingRole ? "تعديل معلومات الدور والصلاحيات" : "إنشاء دور جديد وتعيين الصلاحيات"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الدور</Label>
                <Input
                  id="name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="مثال: مدير المبيعات"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="وصف الدور ومسؤولياته"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">اللون</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={roleColor}
                    onChange={(e) => setRoleColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input value={roleColor} onChange={(e) => setRoleColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-4">
                <Label>الصلاحيات</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto rounded-md border p-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h5 className="mb-2 font-medium text-sm">{category}</h5>
                      <div className="space-y-2">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="rounded border-gray-300"
                            />
                            <span>{perm.display_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={editingRole ? handleUpdate : handleCreate} disabled={loading}>
                {loading ? "جاري الحفظ..." : editingRole ? "حفظ التغييرات" : "إنشاء الدور"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: role.color }} />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                {role.is_system && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="ml-1 h-3 w-3" />
                    دور أساسي
                  </Badge>
                )}
              </div>
              {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>0 موظف</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Key className="h-4 w-4" />
                    <span>0 صلاحية</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.is_system && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">لا توجد أدوار</CardContent>
        </Card>
      )}
    </div>
  );
}
