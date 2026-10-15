"use client";

import { useState } from "react";

import { AlertCircle, Clock, Phone, Search, Ticket, User, MessageSquare, Bot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import type { CustomerServiceRequest, Employee } from "./types";
import {
  formatDateTime,
  getPriorityBgColor,
  getPriorityColor,
  getPriorityLabel,
  getStatusBgColor,
  getStatusBorderColor,
  getStatusColor,
  getStatusLabel,
} from "./utils";

interface CustomerServiceQueueProps {
  requests: CustomerServiceRequest[];
  loading: boolean;
  employees: Employee[];
  onOpen: (request: CustomerServiceRequest) => void;
  onToggleAI: (requestId: string, enabled: boolean) => void;
}

export function CustomerServiceQueue({
  requests,
  loading,
  employees,
  onOpen,
  onToggleAI,
}: CustomerServiceQueueProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = requests.filter(
    (request) =>
      (request.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      request.phone.includes(searchQuery) ||
      (request.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      request.request_type.toLowerCase().includes(searchQuery.toLowerCase()),
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

  if (filteredRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد طلبات خدمة</h3>
          <p className="text-muted-foreground">لم يتم العثور على أي طلبات خدمة مطابقة لبحثك.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">خدمة العملاء</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-semibold truncate">{request.customer_name || "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-3" />
                    <span dir="ltr" className="text-xs">
                      {request.phone}
                    </span>
                  </div>
                  {request.ticket_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Ticket className="size-3" />
                      <span className="font-mono text-xs">{request.ticket_number}</span>
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`${getPriorityBgColor(request.priority)} ${getPriorityColor(request.priority)}`}
                >
                  {getPriorityLabel(request.priority)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-medium">{request.request_type === "human_support" ? "دعم فني" : request.request_type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{formatDateTime(request.created_at)}</span>
                </div>
              </div>

              {request.ai_summary && (
                <div className="p-2 bg-muted rounded-lg text-sm">
                  <p className="line-clamp-2">{request.ai_summary}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${getStatusBorderColor(request.status)} ${getStatusBgColor(request.status)} ${getStatusColor(request.status)}`}
                >
                  {getStatusLabel(request.status)}
                </Badge>
                <div className="flex items-center gap-2 mr-auto">
                  <Switch 
                    checked={request.status !== "closed"} 
                    onCheckedChange={(checked) => onToggleAI(request.id, checked)}
                  />
                  <span className="text-xs text-muted-foreground">AI</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1 text-xs text-green-600 hover:text-green-700"
                  onClick={() => window.open(`https://wa.me/${request.phone.replace(/\+/g, '')}`, "_blank")}
                >
                  <MessageSquare className="size-3 ml-1" />
                  واتساب
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1 text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => onOpen(request)}
                >
                  <Bot className="size-3 ml-1" />
                  محادثة AI
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
