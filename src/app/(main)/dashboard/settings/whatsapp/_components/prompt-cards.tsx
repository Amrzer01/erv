"use client";

import { Calendar, Clock, Expand, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { BotSettings } from "./types";
import { formatDateTime } from "./utils";

interface PromptCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string | null;
  lastUpdated: string;
  onExpand: () => void;
}

function PromptCard({ title, description, icon, prompt, lastUpdated, onExpand }: PromptCardProps) {
  const characterCount = (prompt || "").length;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onExpand}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">{icon}</div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" />
          <span>{characterCount.toLocaleString("ar-SA")} حرف</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          <span>آخر تحديث: {formatDateTime(lastUpdated)}</span>
        </div>
        {prompt && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm line-clamp-2">{prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PromptCardsProps {
  settings: BotSettings | null;
  loading: boolean;
  onExpand: (type: "system" | "pre_trip" | "during_trip" | "post_trip") => void;
}

export function PromptCards({ settings, loading, onExpand }: PromptCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد إعدادات</h3>
          <p className="text-muted-foreground">لم يتم العثور على إعدادات البوت.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PromptCard
        title="الحجز"
        description="يستخدم عند التحدث مع أي عميل لم يقم بالحجز بعد."
        icon={<Calendar className="size-5" />}
        prompt={settings.system_prompt ?? ""}
        lastUpdated={settings.updated_at}
        onExpand={() => onExpand("system")}
      />
      <PromptCard
        title="قبل الرحلة"
        description="يستخدم بعد إنشاء التذكرة وحتى بداية الرحلة."
        icon={<Calendar className="size-5" />}
        prompt={settings.pre_trip_system_prompt ?? ""}
        lastUpdated={settings.updated_at}
        onExpand={() => onExpand("pre_trip")}
      />
      <PromptCard
        title="أثناء الرحلة"
        description="يستخدم أثناء وجود العميل في رحلة العمرة."
        icon={<Calendar className="size-5" />}
        prompt={settings.during_trip_system_prompt ?? ""}
        lastUpdated={settings.updated_at}
        onExpand={() => onExpand("during_trip")}
      />
      <PromptCard
        title="بعد الرحلة"
        description="يستخدم بعد انتهاء الرحلة لمتابعة العميل والعروض المستقبلية."
        icon={<Calendar className="size-5" />}
        prompt={settings.post_trip_system_prompt ?? ""}
        lastUpdated={settings.updated_at}
        onExpand={() => onExpand("post_trip")}
      />
    </div>
  );
}
