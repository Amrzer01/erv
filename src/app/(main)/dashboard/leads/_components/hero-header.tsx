"use client";

import { useEffect, useState } from "react";

export function HeroHeader() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl md:text-4xl tracking-tight font-bold">العملاء المحتملين</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          <span className="hidden sm:inline">متصل بقاعدة البيانات</span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
        جميع الأشخاص الذين تواصلوا مع المساعد الذكي ولم يتحولوا إلى حجوزات حتى الآن.
      </p>
    </div>
  );
}
