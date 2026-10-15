"use client";

import { useState } from "react";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Headphones,
  MapPin,
  MessageSquare,
  Plane,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import type { TimelineGroup, TimelineItem } from "./types";
import { formatTime, getStatusBgColor, getStatusBorderColor, getStatusColor, getStatusLabel } from "./utils";

interface MasterTimelineProps {
  timelineGroups: TimelineGroup[];
  loading: boolean;
  onItemClick: (item: TimelineItem) => void;
}

function getIconForType(type: TimelineItem["type"]) {
  switch (type) {
    case "pre_trip":
      return <Plane className="size-4" />;
    case "during_trip":
      return <MapPin className="size-4" />;
    case "after_sales":
      return <CheckCircle className="size-4" />;
    case "potential_client":
      return <Users className="size-4" />;
    case "human_support":
      return <Headphones className="size-4" />;
    case "completed":
      return <CheckCircle className="size-4" />;
    case "failed":
      return <XCircle className="size-4" />;
    default:
      return <MessageSquare className="size-4" />;
  }
}

function getTypeColor(type: TimelineItem["type"]): string {
  switch (type) {
    case "pre_trip":
      return "text-blue-600 bg-blue-50";
    case "during_trip":
      return "text-purple-600 bg-purple-50";
    case "after_sales":
      return "text-green-600 bg-green-50";
    case "potential_client":
      return "text-orange-600 bg-orange-50";
    case "human_support":
      return "text-red-600 bg-red-50";
    case "completed":
      return "text-green-600 bg-green-50";
    case "failed":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function MasterTimeline({ timelineGroups, loading, onItemClick }: MasterTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-64" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredGroups = timelineGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.phone.includes(searchQuery) ||
          item.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (filteredGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد متابعات مجدولة</h3>
          <p className="text-muted-foreground">لم يتم العثور على أي متابعات مطابقة لبحثك.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">الجدول الزمني</h2>
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو التذكرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {filteredGroups.map((group, groupIndex) => (
        <div key={group.label} className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">{group.label}</h3>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>{getIconForType(item.type)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.customerName}</span>
                          <span className="text-sm text-muted-foreground" dir="ltr">
                            {item.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{formatTime(item.scheduledFor)}</span>
                          <span>•</span>
                          <span>{item.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${getStatusBorderColor(item.status)} ${getStatusBgColor(item.status)} ${getStatusColor(item.status)}`}
                          >
                            {getStatusLabel(item.status)}
                          </Badge>
                          {item.ticketNumber !== "N/A" && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {item.ticketNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
