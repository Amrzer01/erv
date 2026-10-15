"use client";

import { useEffect, useRef, useState } from "react";

import { AlertTriangle, Clock, Copy, Maximize2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import type { BotSettings } from "./types";
import { formatDateTime } from "./utils";

interface SystemPromptEditorProps {
  settings: BotSettings | null;
  loading: boolean;
  onSave: (prompt: string) => Promise<void>;
  isSaving: boolean;
}

export function SystemPromptEditor({ settings, loading, onSave, isSaving }: SystemPromptEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (settings) {
      setPrompt(settings.system_prompt);
      setOriginalPrompt(settings.system_prompt);
    }
  }, [settings]);

  const handleSave = async () => {
    await onSave(prompt);
    setOriginalPrompt(prompt);
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("تم نسخ الـ System Prompt");
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const characterCount = prompt.length;

  return (
    <div className="space-y-4">
      {/* Warning Card */}
      <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-900 text-right">
        <AlertTriangle className="size-4 text-orange-600" />
        <AlertTitle className="text-orange-900">تنبيه</AlertTitle>
        <AlertDescription className="text-orange-800">
          أي تعديل على الـ System Prompt سيؤثر مباشرة على طريقة عمل المساعد الذكي.
        </AlertDescription>
      </Alert>

      {/* Editor Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">System Prompt</h3>
              {settings && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="size-3" />
                  <span>آخر تحديث: {formatDateTime(settings.updated_at)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={isSaving || prompt === originalPrompt}
              >
                <RotateCcw className="size-4 ml-2" />
                إعادة تعيين
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm" disabled={isSaving || !prompt}>
                <Copy className="size-4 ml-2" />
                نسخ
              </Button>
              <Button onClick={handleExpand} variant="outline" size="sm" disabled={isSaving}>
                <Maximize2 className="size-4 ml-2" />
                توسيع
              </Button>
              <Button onClick={handleSave} size="sm" disabled={isSaving || prompt === originalPrompt || loading}>
                <Save className="size-4 ml-2" />
                {isSaving ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="أدخل الـ System Prompt هنا..."
              className="font-mono text-sm min-h-[300px] resize-none"
              disabled={loading || isSaving}
            />
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {characterCount} حرف
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Prompt - وضع التوسع</h2>
            <Button onClick={() => setIsExpanded(false)} variant="outline">
              إغلاق
            </Button>
          </div>
          <div className="flex-1 relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="أدخل الـ System Prompt هنا..."
              className="font-mono text-sm h-full resize-none"
              disabled={loading || isSaving}
            />
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {characterCount} حرف
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleReset} variant="outline" disabled={isSaving || prompt === originalPrompt}>
              <RotateCcw className="size-4 ml-2" />
              إعادة تعيين
            </Button>
            <Button onClick={handleCopy} variant="outline" disabled={isSaving || !prompt}>
              <Copy className="size-4 ml-2" />
              نسخ
            </Button>
            <Button onClick={handleSave} disabled={isSaving || prompt === originalPrompt || loading}>
              <Save className="size-4 ml-2" />
              {isSaving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
