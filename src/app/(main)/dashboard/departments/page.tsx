"use client";

import { useEffect, useState } from "react";

import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  initializeDepartmentsFromExisting,
  updateDepartment,
} from "./_actions/departments";

interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const loadDepartments = async () => {
    setLoading(true);
    const result = await getDepartments();
    if (result.success && result.data) {
      setDepartments(result.data);
    } else {
      toast.error("تعذر تحميل الأقسام");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async () => {
    if (!departmentName.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    setIsSubmitting(true);
    const result = await createDepartment(departmentName.trim());

    if (result.success) {
      toast.success("تم إضافة القسم بنجاح");
      setDialogOpen(false);
      setDepartmentName("");
      loadDepartments();
    } else {
      toast.error(result.error || "تعذر إضافة القسم");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editingDepartment || !departmentName.trim()) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    setIsSubmitting(true);
    const result = await updateDepartment(editingDepartment.id, departmentName.trim());

    if (result.success) {
      toast.success("تم تحديث القسم بنجاح");
      setDialogOpen(false);
      setEditingDepartment(null);
      setDepartmentName("");
      loadDepartments();
    } else {
      toast.error(result.error || "تعذر تحديث القسم");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    const result = await deleteDepartment(departmentToDelete.id);

    if (result.success) {
      toast.success("تم حذف القسم بنجاح");
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      loadDepartments();
    } else {
      toast.error(result.error || "تعذر حذف القسم");
    }
  };

  const openCreateDialog = () => {
    setEditingDepartment(null);
    setDepartmentName("");
    setDialogOpen(true);
  };

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentName(department.name);
    setDialogOpen(true);
  };

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleInitialize = async () => {
    const result = await initializeDepartmentsFromExisting();
    if (result.success) {
      toast.success(result.message);
      loadDepartments();
    } else {
      toast.error(result.error || "تعذر تهيئة الأقسام");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الأقسام</h1>
          <p className="text-muted-foreground mt-2">إدارة الأقسام في النظام</p>
        </div>
        <div className="flex gap-2">
          {departments.length === 0 && (
            <Button variant="outline" onClick={handleInitialize}>
              <Building2 className="ml-2 h-4 w-4" />
              تهيئة من البيانات الموجودة
            </Button>
          )}
          <Button onClick={openCreateDialog}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة قسم
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأقسام</CardTitle>
          <CardDescription>
            {departments.length === 0 ? "لا توجد أقسام حالياً" : `إجمالي ${departments.length} قسم`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>لا توجد أقسام حالياً</p>
              <p className="text-sm mt-2">اضغط على "إضافة قسم" لإنشاء قسم جديد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{department.name}</p>
                      <p className="text-sm text-muted-foreground">
                        تم الإنشاء: {new Date(department.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(department)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog
                      open={deleteDialogOpen && departmentToDelete?.id === department.id}
                      onOpenChange={(open) => {
                        if (!open) setDepartmentToDelete(null);
                        else setDeleteDialogOpen(open);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(department)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف الإدارة "{department.name}"؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
            <DialogDescription>
              {editingDepartment ? "تعديل اسم القسم" : "أدخل اسم القسم الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department-name">اسم القسم</Label>
              <Input
                id="department-name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="مثال: المبيعات"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button onClick={editingDepartment ? handleUpdate : handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : editingDepartment ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
