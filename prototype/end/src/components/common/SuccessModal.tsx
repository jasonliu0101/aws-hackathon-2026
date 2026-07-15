"use client";

import { PartyPopper, ArrowUpRight } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface SuccessInfo {
  xp: number;
  coins?: number;
  buildingName: string;
  message?: string;
  leveledUp?: boolean;
}

/**
 * Celebration shown on task/quiz completion.
 * Deliberately offers only two calm choices — never auto-pushes new tasks.
 */
export function SuccessModal({
  info,
  onClose,
  onAnother,
}: {
  info: SuccessInfo | null;
  onClose: () => void;
  onAnother?: () => void;
}) {
  return (
    <Dialog open={info !== null} onClose={onClose}>
      {info && (
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand-sun/20 animate-float">
            <PartyPopper className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold">做得好！</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {info.message ?? "你的城市又長大了一點點。"}
          </p>

          <div className="mt-4 space-y-2 rounded-2xl bg-muted/60 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">獲得經驗值</span>
              <span className="font-bold text-brand-sky">+{info.xp} XP</span>
            </div>
            {info.coins !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">獲得金幣</span>
                <span className="font-bold text-amber-600">+{info.coins} 金幣</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">成長的建築</span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <ArrowUpRight className="h-4 w-4 text-brand-mint" />
                {info.buildingName}
              </span>
            </div>
            {info.leveledUp && (
              <div className="rounded-xl bg-brand-sun/20 py-1.5 text-xs font-semibold text-amber-700 animate-pop-in">
                🎉 建築升級了！
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              關閉
            </Button>
            {onAnother && (
              <Button className="flex-1" onClick={onAnother}>
                再做一個短任務
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
