"use client";

import { useEffect, useState, useRef } from "react";
import { User, Phone, Briefcase, Building, Save, Camera, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getDepartments } from "@/app/(main)/dashboard/departments/_actions/departments";

export default function ProfilePage() {
  const { currentEmployee, currentUser, refreshEmployee } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    job_title: "",
    department: "",
  });

  useEffect(() => {
    if (currentEmployee) {
      setFormData({
        full_name: currentEmployee.full_name || "",
        phone: currentEmployee.phone || "",
        job_title: currentEmployee.job_title || "",
        department: currentEmployee.department || "",
      });
    }
  }, [currentEmployee]);

  useEffect(() => {
    const loadDepartments = async () => {
      const result = await getDepartments();
      if (result.success && result.data) {
        setDepartments(result.data);
      }
    };
    loadDepartments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 2MB');
        return;
      }
      
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !currentEmployee) return;
    
    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentEmployee.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('دخل التخزين غير موجود. يرجى إنشاء دخل "avatars" في Supabase Storage.');
        } else {
          toast.error('تعذر رفع الصورة: ' + uploadError.message);
        }
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ avatar_url: publicUrl })
        .eq('id', currentEmployee.id);

      if (updateError) {
        toast.error('تعذر تحديث الصورة في الملف الشخصي');
        return;
      }

      toast.success('تم تحديث الصورة بنجاح');
      setSelectedFile(null);
      setPreviewUrl(null);
      refreshEmployee();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentEmployee) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({ avatar_url: null })
        .eq('id', currentEmployee.id);

      if (error) {
        toast.error('تعذر حذف الصورة');
        return;
      }

      toast.success('تم حذف الصورة بنجاح');
      refreshEmployee();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الصورة');
    }
  };

  const handleSave = async () => {
    if (!currentEmployee) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          job_title: formData.job_title || null,
          department: formData.department || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentEmployee.id);

      if (error) {
        toast.error("تعذر تحديث الملف الشخصي");
        return;
      }

      toast.success("تم تحديث الملف الشخصي بنجاح");
      refreshEmployee();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setSaving(false);
    }
  };

  if (!currentEmployee || !currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <p className="text-muted-foreground mt-2">إدارة معلوماتك الشخصية</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلوماتي</CardTitle>
          <CardDescription>تحديث بياناتك الشخصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={previewUrl || currentEmployee.avatar_url || currentUser.user_metadata.avatar_url || undefined} 
                />
                <AvatarFallback className="text-2xl">
                  {currentEmployee.full_name?.charAt(0) || currentUser.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentEmployee.full_name}</h3>
              <p className="text-sm text-muted-foreground">{currentEmployee.email}</p>
              <div className="flex gap-2 mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="ml-2 h-4 w-4" />
                  تغيير الصورة
                </Button>
                {selectedFile && (
                  <Button 
                    size="sm" 
                    onClick={handleUploadAvatar}
                    disabled={uploading}
                  >
                    {uploading ? "جاري الرفع..." : "رفع"}
                  </Button>
                )}
                {currentEmployee.avatar_url && !selectedFile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveAvatar}
                  >
                    حذف
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job_title">المسمى الوظيفي</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="مثال: مدير مبيعات"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="department">
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

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                value={currentUser.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="ml-2 h-4 w-4" />
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
