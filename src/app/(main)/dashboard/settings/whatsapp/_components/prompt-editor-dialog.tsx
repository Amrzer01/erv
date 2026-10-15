"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Calendar,
  Clipboard,
  Clock,
  Copy,
  FileText,
  Hash,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { formatDateTime } from "./utils";

type PromptType = "system" | "pre_trip" | "during_trip" | "post_trip";

interface PromptEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: PromptType;
  title: string;
  description: string;
  initialPrompt: string;
  lastUpdated: string;
  createdAt: string;
  onSave: (prompt: string) => Promise<void>;
}

const PROMPT_CONFIGS: Record<PromptType, { title: string; description: string; column: string }> = {
  system: { title: "الحجز", description: "يستخدم عند التحدث مع أي عميل لم يقم بالحجز بعد.", column: "system_prompt" },
  pre_trip: {
    title: "قبل الرحلة",
    description: "يستخدم بعد إنشاء التذكرة وحتى بداية الرحلة.",
    column: "pre_trip_system_prompt",
  },
  during_trip: {
    title: "أثناء الرحلة",
    description: "يستخدم أثناء وجود العميل في رحلة العمرة.",
    column: "during_trip_system_prompt",
  },
  post_trip: {
    title: "بعد الرحلة",
    description: "يستخدم بعد انتهاء الرحلة لمتابعة العميل والعروض المستقبلية.",
    column: "post_trip_system_prompt",
  },
};

export function PromptEditorDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  initialPrompt,
  lastUpdated,
  createdAt,
  onSave,
}: PromptEditorDialogProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [originalPrompt, setOriginalPrompt] = useState(initialPrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useMonospace, setUseMonospace] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setPrompt(initialPrompt);
      setOriginalPrompt(initialPrompt);
      setHasUnsavedChanges(false);
    }
  }, [open, initialPrompt]);

  useEffect(() => {
    setHasUnsavedChanges(prompt !== originalPrompt);
  }, [prompt, originalPrompt]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(prompt);
      setOriginalPrompt(prompt);
      setHasUnsavedChanges(false);
      toast.success("تم حفظ التعليمات بنجاح");
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("فشل حفظ التعليمات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    setHasUnsavedChanges(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("تم نسخ التعليمات");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPrompt(text);
      toast.success("تم لصق النص");
    } catch (error) {
      toast.error("فشل لصق النص");
    }
  };

  const handleClear = () => {
    setPrompt("");
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape" && !hasUnsavedChanges) {
        onOpenChange(false);
      }
    },
    [hasUnsavedChanges, onOpenChange],
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const handleOpenChange = (newOpen: boolean) => {
    if (hasUnsavedChanges && !newOpen) {
      const confirmed = window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة؟");
      if (!confirmed) return;
    }
    onOpenChange(newOpen);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Statistics
  const characters = prompt.length;
  const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const lines = prompt.split("\n").length;
  const estimatedTokens = Math.ceil(prompt.length / 4);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={() => handleOpenChange(false)} />

      {/* Dialog Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`relative bg-background border rounded-lg shadow-lg flex flex-col w-full max-w-6xl h-[90vh] ${isFullscreen ? "h-screen w-screen max-w-none rounded-none" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="animate-pulse">
                    تغييرات غير محفوظة
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleOpenChange(false)}>
                  <X className="size-5" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">{description}</p>
          </div>

          {/* Toolbar */}
          <div className="flex-shrink-0 p-4 border-b flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="size-4 ml-2" />
              نسخ
            </Button>
            <Button size="sm" variant="outline" onClick={handlePaste}>
              <Clipboard className="size-4 ml-2" />
              لصق
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear}>
              <Trash2 className="size-4 ml-2" />
              مسح
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges}>
              <RotateCcw className="size-4 ml-2" />
              استعادة
            </Button>
            <Button size="sm" variant="outline" onClick={() => setUseMonospace(!useMonospace)}>
              <FileText className="size-4 ml-2" />
              {useMonospace ? "عادي" : "Monospace"}
            </Button>
            <div className="flex-1" />
            <Button size="sm" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              <Save className="size-4 ml-2" />
              {isSaving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex gap-6 overflow-hidden p-4">
            {/* Textarea */}
            <div className="flex-1 overflow-hidden min-w-0">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="أدخل التعليمات هنا..."
                className={`w-full h-full resize-none text-base leading-relaxed ${useMonospace ? "font-mono" : ""}`}
                dir="rtl"
              />
            </div>

            {/* Statistics Sidebar */}
            <div className="w-64 flex-shrink-0 space-y-4 overflow-y-auto hidden lg:block">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">الإحصائيات</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="size-4" />
                      <span>الأحرف</span>
                    </div>
                    <span className="font-medium">{characters.toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="size-4" />
                      <span>الكلمات</span>
                    </div>
                    <span className="font-medium">{words.toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="size-4" />
                      <span>الأسطر</span>
                    </div>
                    <span className="font-medium">{lines.toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="size-4" />
                      <span>Tokens (تقريبي)</span>
                    </div>
                    <span className="font-medium">{estimatedTokens.toLocaleString("ar-SA")}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">المعلومات</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span>آخر حفظ:</span>
                  </div>
                  <p className="text-xs">{formatDateTime(lastUpdated)}</p>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Calendar className="size-4" />
                    <span>إنشاء:</span>
                  </div>
                  <p className="text-xs">{formatDateTime(createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">اختصارات لوحة المفاتيح</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Ctrl + S: حفظ</p>
                  <p>Esc: إغلاق (بدون تغييرات)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
