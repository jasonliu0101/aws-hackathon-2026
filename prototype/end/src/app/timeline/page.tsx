"use client";

import { useMemo } from "react";
import {
  Play,
  CheckCircle2,
  PencilLine,
  HelpCircle,
  Layers,
  TrendingUp,
} from "lucide-react";
import type { ActivityEntry, ActivityType } from "@/types";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMinutes } from "@/lib/utils";

const ICON: Record<ActivityType, typeof Play> = {
  watch: Play,
  task: CheckCircle2,
  note: PencilLine,
  quiz: HelpCircle,
  review: Layers,
  upgrade: TrendingUp,
};

const COLOR: Record<ActivityType, string> = {
  watch: "bg-brand-sky/15 text-brand-sky",
  task: "bg-brand-mint/20 text-emerald-600",
  note: "bg-brand-sun/20 text-amber-600",
  quiz: "bg-violet-100 text-violet-600",
  review: "bg-brand-coral/15 text-rose-500",
  upgrade: "bg-brand-mint/20 text-emerald-600",
};

export default function TimelinePage() {
  const { state } = useStore();

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    for (const a of state.activity) {
      if (!map.has(a.date)) map.set(a.date, []);
      map.get(a.date)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [state.activity]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">學習紀錄</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          這是你的學習足跡。沒有學習的日子不會被標記為失敗 —— 每一次回來都值得記錄。
        </p>
      </div>

      <div className="space-y-6">
        {grouped.map(([date, entries]) => {
          const dayMinutes = entries.reduce((s, e) => s + (e.minutes ?? 0), 0);
          return (
            <div key={date}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold">{formatDate(date)}</span>
                {dayMinutes > 0 && (
                  <span className="text-xs text-muted-foreground">
                    學習 {formatMinutes(dayMinutes)}
                  </span>
                )}
              </div>
              <Card>
                <CardContent className="space-y-1 p-4">
                  {entries.map((a) => {
                    const Icon = ICON[a.type];
                    return (
                      <div key={a.id} className="flex items-center gap-3 py-1.5">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${COLOR[a.type]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm">{a.title}</span>
                        {a.minutes && (
                          <span className="text-xs text-muted-foreground">
                            {a.minutes} 分
                          </span>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
