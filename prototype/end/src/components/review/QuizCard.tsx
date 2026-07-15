"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Quiz } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuizCard({
  quiz,
  onAnswered,
}: {
  quiz: Quiz;
  onAnswered?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const correct = selected === quiz.answerIndex;

  function choose(i: number) {
    if (revealed) return;
    setSelected(i);
    onAnswered?.(i === quiz.answerIndex);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold">{quiz.question}</h3>
        <div className="mt-4 space-y-2">
          {quiz.options.map((opt, i) => {
            const isAnswer = i === quiz.answerIndex;
            const isPicked = i === selected;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                  !revealed && "border-border hover:border-primary hover:bg-primary/5",
                  revealed && isAnswer && "border-emerald-400 bg-brand-mint/15",
                  revealed && isPicked && !isAnswer && "border-rose-300 bg-brand-coral/10",
                  revealed && !isAnswer && !isPicked && "border-border opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    revealed && isAnswer && "border-emerald-400 bg-emerald-400 text-white",
                    revealed && isPicked && !isAnswer && "border-rose-400 bg-rose-400 text-white",
                    !revealed && "border-border",
                  )}
                >
                  {revealed && isAnswer ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : revealed && isPicked && !isAnswer ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className={cn(
              "mt-4 rounded-xl p-3 text-sm animate-rise",
              correct ? "bg-brand-mint/15 text-emerald-700" : "bg-brand-sun/15 text-amber-700",
            )}
          >
            <div className="font-semibold">
              {correct ? "答對了！+5 XP 🎉" : "再想想～看看解析"}
            </div>
            <p className="mt-1 text-muted-foreground">{quiz.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
