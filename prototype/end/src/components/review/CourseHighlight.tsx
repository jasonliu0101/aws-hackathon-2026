"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { Course } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { generateCatchupSummary } from "@/lib/ai";
import { asset } from "@/lib/asset";

const HIGHLIGHT_MEDIA: Partial<Record<string, { video: string; captions: string; duration: string }>> = {
  "c-dental": {
    video: "/assets/videos/scientific-brushing-highlight.mp4",
    captions: "/assets/videos/scientific-brushing-highlight.vtt",
    duration: "23 秒",
  },
};

/** 30–90 second "course essence" — AI-generated key points (mocked). */
export function CourseHighlight({ course }: { course: Course }) {
  const [points, setPoints] = useState<string[] | null>(null);
  const media = HIGHLIGHT_MEDIA[course.id];

  useEffect(() => {
    let alive = true;
    setPoints(null);
    generateCatchupSummary(course).then((p) => alive && setPoints(p));
    return () => {
      alive = false;
    };
  }, [course]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-brand-sky" />
          {course.title} · {media?.duration ?? "60 秒"}精華
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          AI 助教幫你濃縮這門課的重點，快速喚醒記憶。
        </p>

        {media && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
            <video controls playsInline preload="metadata" className="aspect-video w-full bg-black object-contain">
              <source src={asset(media.video)} type="video/mp4" />
              <track src={asset(media.captions)} kind="captions" srcLang="zh-Hant" label="繁體中文字幕" default />
              你的瀏覽器不支援影片播放。
            </video>
          </div>
        )}

        {points === null ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI 正在整理重點…
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm animate-rise">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-sky/15 text-[11px] font-bold text-brand-sky">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
