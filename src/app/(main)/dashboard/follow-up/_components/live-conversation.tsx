"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

import type { ConversationMessage, Employee, PotentialClient } from "./types";
import { formatDateTime, formatPhoneNumber } from "./utils";

interface LiveConversationProps {
  potentialClient: PotentialClient | null;
  employees: Employee[];
}

export function LiveConversation({ potentialClient, employees }: LiveConversationProps) {
  const { currentEmployee } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(potentialClient?.takeover_state !== "HUMAN_ACTIVE");
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const isTakeoverActive = potentialClient?.takeover_state === "HUMAN_ACTIVE";
  const isMyTakeover = potentialClient?.takeover_employee_id === currentEmployee?.id;
  const takeoverEmployee = employees.find((e) => e.id === potentialClient?.takeover_employee_id);

  // Sync AI toggle with takeover state
  useEffect(() => {
    setAiEnabled(potentialClient?.takeover_state !== "HUMAN_ACTIVE");
  }, [potentialClient?.takeover_state]);

  const handleToggleAI = async () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    
    // Update the takeover state in the database
    try {
      const supabase = createClient();
      await supabase
        .from("potential_clients")
        .update({
          takeover_state: newState ? "AI_ACTIVE" : "HUMAN_ACTIVE",
          takeover_employee_id: newState ? null : currentEmployee?.id,
          takeover_timestamp: newState ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", potentialClient?.id);
    } catch (error) {
      console.error("Error toggling AI:", error);
      toast.error("فشل تغيير حالة AI");
    }
  };

  const fetchMessages = async () => {
    if (!potentialClient?.phone) return;

    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("phone", potentialClient.phone)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    if (!potentialClient?.phone) return;

    fetchMessages();

    const channelName = `conversation_messages_${potentialClient.phone}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_messages", filter: `phone=eq.${potentialClient.phone}` }, () => {
        fetchMessages();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error('Subscription error for conversation messages');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [potentialClient?.phone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !potentialClient?.id || !currentEmployee?.id) return;

    setIsSending(true);

    try {
      // Just send the message, don't check for takeover control for now
      const result = await sendEmployeeMessage(potentialClient.id, inputMessage, currentEmployee.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم إرسال الرسالة");
        setInputMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("فشل إرسال الرسالة");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSenderName = (message: ConversationMessage) => {
    if (message.sender_type === "customer") return "العميل";
    if (message.sender_type === "bot") return "البوت";
    if (message.sender_type === "employee") {
      const emp = employees.find((e) => e.id === message.employee_id);
      return emp?.full_name || "موظف";
    }
    return "غير معروف";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (!potentialClient) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="p-6 text-center text-muted-foreground">
          حدد عميل محتمل لعرض المحادثة
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(potentialClient.customer_name || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">
              {potentialClient.customer_name || "عميل محتمل"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono" dir="ltr">
                {formatPhoneNumber(potentialClient.phone)}
              </span>
              <Badge variant={aiEnabled ? "secondary" : "default"} className="text-xs">
                {aiEnabled ? "AI نشط" : "نشط"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={aiEnabled} onCheckedChange={handleToggleAI} />
            <span className="text-sm">AI</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-base">ابدأ المحادثة بإرسال رسالة</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.direction === "outgoing" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.sender_type === "customer"
                          ? "bg-gray-200 text-gray-700"
                          : message.sender_type === "bot"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-600 text-white"
                      }
                    >
                      {getInitials(getSenderName(message))}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.direction === "outgoing"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.message_text}
                    </p>
                    <p
                      className={`text-[10px] mt-2 ${
                        message.direction === "outgoing" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatDateTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Textarea
              placeholder={aiEnabled ? "AI نشط - يتم الرد تلقائياً" : "اكتب رسالتك..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending || aiEnabled}
              className="flex-1 min-h-[80px] resize-none font-mono text-sm"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !inputMessage.trim() || aiEnabled}
              size="icon"
              className="h-[80px] w-[80px] flex-shrink-0"
            >
              {isSending ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9 5" />
                  <path d="M22 2l-11 13" />
                </svg>
              )}
            </Button>
          </div>
          {aiEnabled && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              AI نشط - يتم الرد تلقائياً على الرسائل
            </p>
          )}
        </div>
      </div>
    </div>
  );
}