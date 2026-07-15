"use client";

import { useState } from "react";
import { RotateCw, Sparkles } from "lucide-react";
import type { Flashcard as FlashcardType, Familiarity } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Familiarity; label: string; className: string }[] = [
  { value: "known", label: "我記得", className: "bg-brand-mint/20 text-emerald-700 hover:bg-brand-mint/30" },
  { value: "fuzzy", label: "有點模糊", className: "bg-brand-sun/25 text-amber-700 hover:bg-brand-sun/35" },
  { value: "forgot", label: "我忘了", className: "bg-brand-coral/20 text-rose-600 hover:bg-brand-coral/30" },
];

export function Flashcard({
  card,
  onRate,
  onExplain,
}: {
  card: FlashcardType;
  onRate: (familiarity: Familiarity) => void;
  onExplain?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <Card
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "flex min-h-[220px] cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors",
          flipped ? "bg-brand-sky/5" : "bg-card",
        )}
      >
        <span className="mb-3 text-xs font-medium text-muted-foreground">
          {flipped ? "答案" : "問題"}（點擊翻面）
        </span>
        <p className="text-lg font-semibold leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        <RotateCw className="mt-4 h-4 w-4 text-muted-foreground" />
      </Card>

      {flipped ? (
        <div className="space-y-3 animate-rise">
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onRate(o.value)}
                className={cn(
                  "rounded-xl py-3 text-sm font-semibold transition-colors",
                  o.className,
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          {onExplain && (
            <Button variant="soft" className="w-full" onClick={onExplain}>
              <Sparkles className="h-4 w-4" />
              請 AI 助教換個方式解釋
            </Button>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          先想想答案，再點卡片翻面 🤔
        </p>
      )}
    </div>
  );
}
