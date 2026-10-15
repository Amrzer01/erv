"use client";

import { Check, Clock, Loader2 } from "lucide-react";

interface TimelineItem {
  label: string;
  completed: boolean;
  time?: string;
}

interface ConversationTimelineProps {
  timeline: TimelineItem[];
}

export function ConversationTimeline({ timeline }: ConversationTimelineProps) {
  return (
    <div className="space-y-0">
      {timeline.map((item, index) => (
        <div key={index} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <div
              className={`size-6 rounded-full flex items-center justify-center ${
                item.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {item.completed ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
            </div>
            {index < timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${item.completed ? "font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {item.time && <span className="text-xs text-muted-foreground">{item.time}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
