"use client";

import { useState } from "react";

import { Clock, ExternalLink, MessageSquare, Phone, Search, TrendingUp, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import type { PotentialClient } from "./types";
import { formatDateTime, formatRelativeTime, getStageBadgeVariant } from "./utils";

interface PotentialClientsCardsProps {
  clients: PotentialClient[];
  loading: boolean;
  onOpenLead: (client: PotentialClient) => void;
}

export function PotentialClientsCards({ clients, loading, onOpenLead }: PotentialClientsCardsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.stage?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد عملاء محتملين للمتابعة</h3>
          <p className="text-muted-foreground">لم يتم العثور على أي عملاء محتملين يحتاجون متابعة.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">العملاء المحتملون</h2>
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو المرحلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-semibold truncate">{client.customer_name || "غير معروف"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-3" />
                    <span dir="ltr" className="text-xs">
                      {client.phone}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={getStageBadgeVariant(client.stage)}>{client.stage}</Badge>
                  {client.takeover_state && client.takeover_state !== "AI_ACTIVE" && (
                    <Badge variant="outline" className="text-xs">
                      {client.takeover_state === "HUMAN_REQUESTED" && "طلب بشري"}
                      {client.takeover_state === "ASSIGNED" && "معين"}
                      {client.takeover_state === "HUMAN_ACTIVE" && "نشط بشري"}
                      {client.takeover_state === "COMPLETED" && "مكتمل"}
                      {client.takeover_state === "CANCELLED" && "ملغي"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">احتمالية الحجز</span>
                  <span className="font-semibold">{client.booking_probability}%</span>
                </div>
                <Progress value={client.booking_probability} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3" />
                  <span>
                    المتابعة القادمة:{" "}
                    {client.next_follow_up_at ? formatRelativeTime(client.next_follow_up_at) : "غير محدد"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="size-3" />
                  <span>عدد المتابعات: {client.follow_up_count}</span>
                </div>
              </div>

              {client.summary && (
                <div className="p-2 bg-muted rounded-lg text-sm">
                  <p className="line-clamp-2">{client.summary}</p>
                </div>
              )}

              {client.last_message && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">آخر رسالة AI:</span>
                  <p className="line-clamp-1 mt-1">{client.last_message}</p>
                </div>
              )}

              <Button size="sm" variant="outline" className="w-full" onClick={() => onOpenLead(client)}>
                <ExternalLink className="size-4 ml-2" />
                فتح العميل المحتمل
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
