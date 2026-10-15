"use client";

import { Copy, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AiSummaryCardProps {
  summary: string;
}

export function AiSummaryCard({ summary }: AiSummaryCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="size-5 text-purple-600" />
            ملخص الذكاء الاصطناعي
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
      </CardContent>
    </Card>
  );
}
