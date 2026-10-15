"use client";

import { CheckCircle, Clock, ExternalLink, Phone, RefreshCw, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { CustomerFollowUp, KanbanStatus } from "./types";
import { formatTime, getStatusBgColor, getStatusBorderColor, getStatusColor, getStatusLabel } from "./utils";

interface KanbanColumnProps {
  title: string;
  status: KanbanStatus;
  items: CustomerFollowUp[];
  onItemClick: (item: CustomerFollowUp) => void;
  onMarkCompleted: (item: CustomerFollowUp) => void;
  onRetry: (item: CustomerFollowUp) => void;
}

function KanbanColumn({ title, status, items, onItemClick, onMarkCompleted, onRetry }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[300px] space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium truncate">{item.event_name || "غير معروف"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-3" />
                    <span dir="ltr" className="text-xs">
                      {item.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="size-3" />
                    <span>{formatTime(item.scheduled_for)}</span>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusBorderColor(item.status)} ${getStatusBgColor(item.status)} ${getStatusColor(item.status)}`}
                    >
                      {item.follow_up_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => onItemClick(item)}>
                  <ExternalLink className="size-3 ml-1" />
                  عرض العميل
                </Button>
                {status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-green-600 hover:text-green-700"
                    onClick={() => onMarkCompleted(item)}
                  >
                    <CheckCircle className="size-3 ml-1" />
                    إكمال
                  </Button>
                )}
                {status === "failed" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => onRetry(item)}
                  >
                    <RefreshCw className="size-3 ml-1" />
                    إعادة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">لا توجد عناصر</div>}
      </div>
    </div>
  );
}

interface TodaysWorkKanbanProps {
  followUps: CustomerFollowUp[];
  loading: boolean;
  onItemClick: (item: CustomerFollowUp) => void;
  onMarkCompleted: (item: CustomerFollowUp) => void;
  onRetry: (item: CustomerFollowUp) => void;
}

export function TodaysWorkKanban({ followUps, loading, onItemClick, onMarkCompleted, onRetry }: TodaysWorkKanbanProps) {
  const columns = [
    { title: "قيد الانتظار", status: "pending" as KanbanStatus },
    { title: "قيد التنفيذ", status: "in_progress" as KanbanStatus },
    { title: "مكتمل", status: "completed" as KanbanStatus },
    { title: "فشل", status: "failed" as KanbanStatus },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.status} className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-8" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">عمل اليوم</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            items={followUps.filter((f) => f.status === col.status)}
            onItemClick={onItemClick}
            onMarkCompleted={onMarkCompleted}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}
