"use client";

import { Progress } from "@/components/ui/progress";
import { xpIntoLevel } from "@/lib/xp";

export function XpBar({ xp }: { xp: number }) {
  const { current, needed } = xpIntoLevel(xp);
  const pct = (current / needed) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>本級進度</span>
        <span>
          {current} / {needed} XP
        </span>
      </div>
      <Progress value={pct} indicatorClassName="bg-brand-sun" />
    </div>
  );
}
