"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { BUILDING_ASSETS } from "@/lib/building-assets";
import type { ActivityEntry, ActivityType, CategoryId } from "@/types";
import { reviewHref } from "@/lib/routes";

const DAY_MS = 24 * 60 * 60 * 1000;

const activityMeta: Record<ActivityType, { label: string; icon: typeof Play; className: string; xp: number }> = {
  watch: { label: "影片課程", icon: Play, className: "bg-indigo-50 text-indigo-600", xp: 20 },
  upgrade: { label: "學習系統", icon: Building2, className: "bg-sky-50 text-sky-600", xp: 30 },
  quiz: { label: "測驗任務", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600", xp: 20 },
  note: { label: "學習筆記", icon: NotebookPen, className: "bg-amber-50 text-amber-600", xp: 10 },
  review: { label: "複習任務", icon: RotateCcw, className: "bg-violet-50 text-violet-600", xp: 15 },
  task: { label: "學習任務", icon: Trophy, className: "bg-rose-50 text-rose-600", xp: 20 },
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRange(start: Date, end: Date) {
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
}

export default function CalendarPage() {
  const { state } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const anchor = new Date(2026, 6, 15);
    anchor.setDate(anchor.getDate() - weekOffset * 7);
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - anchor.getDay());
    return Array.from({ length: 7 }, (_, index) => new Date(start.getTime() + index * DAY_MS));
  }, [weekOffset]);

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const currentKey = "2026-07-15";
  const activitiesByDate = useMemo(() => {
    const grouped = new Map<string, ActivityEntry[]>();
    state.activity.forEach((activity) => grouped.set(activity.date, [...(grouped.get(activity.date) ?? []), activity]));
    return grouped;
  }, [state.activity]);
  const weekActivities = state.activity.filter((activity) => activity.date >= toDateKey(weekStart) && activity.date <= toDateKey(weekEnd));
  const highlights = weekActivities.filter((activity) => activity.type === "watch").slice(0, 3);
  const displayHighlights = highlights.length ? highlights : state.activity.filter((activity) => activity.type === "watch").slice(0, 3);

  return (
    <div className="app-page-bg min-h-screen px-3 py-5 text-slate-900 sm:px-5 lg:px-7 lg:py-7">
      <div className="mx-auto max-w-[1380px] space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Link href="/" className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-white"><ArrowLeft className="h-5 w-5" /></Link>
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">Learning calendar</p><h1 className="text-2xl font-black tracking-tight text-slate-900">學習日曆</h1></div>
        </div>

        <section className="rounded-[22px] border border-white/80 bg-white/90 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
            <button onClick={() => setWeekOffset((value) => value + 1)} aria-label="上一週" className="grid h-9 w-9 place-items-center rounded-xl text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"><ChevronLeft className="h-5 w-5" /></button>
            <div className="text-center"><p className="font-black">{formatRange(weekStart, weekEnd)}</p><p className="mt-1 text-[11px] font-medium text-slate-400">查看每日學習進度與活動紀錄</p></div>
            <button onClick={() => setWeekOffset((value) => Math.max(0, value - 1))} disabled={weekOffset === 0} aria-label="下一週" className="grid h-9 w-9 place-items-center rounded-xl text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
          </div>

          <div className="no-scrollbar overflow-x-auto p-3 sm:p-4">
            <div className="grid min-w-[980px] grid-cols-7 gap-3">
              {weekDays.map((date) => {
                const key = toDateKey(date);
                const dayActivities = activitiesByDate.get(key) ?? [];
                const isCurrent = key === currentKey;
                return (
                  <article key={key} className={`flex min-h-[245px] flex-col rounded-2xl border p-3 transition ${isCurrent ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-[0_12px_25px_-18px_rgba(79,70,229,.75)]" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                    <div className="text-center"><p className={`text-xs font-bold ${isCurrent ? "text-indigo-600" : "text-slate-500"}`}>{date.toLocaleDateString("zh-TW", { weekday: "short" })}</p><p className="mt-1 text-xl font-black">{date.getDate()}</p></div>
                    <div className="mt-3 space-y-2">
                      {dayActivities.slice(0, 2).map((activity) => {
                        const meta = activityMeta[activity.type];
                        const Icon = meta.icon;
                        return <div key={activity.id} className="rounded-xl border border-slate-100 bg-white/90 p-2.5"><div className="flex items-start gap-2"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${meta.className}`}><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-[10px] font-bold text-slate-500">{meta.label}</p><p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-4">{activity.title}</p></div></div>{isCurrent && <p className="mt-2 text-right text-[10px] font-black text-indigo-600">+{meta.xp} XP</p>}</div>;
                      })}
                    </div>
                    {dayActivities.length === 0 && <p className="mt-auto pt-3 text-center text-[11px] text-slate-400">今天還沒有紀錄</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-white/80 bg-white/95 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-end justify-between"><div><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /><h2 className="text-lg font-black">精華回顧</h2></div><p className="mt-1 text-xs text-slate-400">快速複習本週重點內容</p></div><Link href={reviewHref("highlights")} className="hidden items-center gap-1 text-xs font-bold text-indigo-600 sm:flex">查看更多<ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid gap-3 lg:grid-cols-3">
            {displayHighlights.map((activity, index) => {
              const category = activity.category ?? "investing";
              const building = state.buildings.find((item) => item.id === category);
              const accent = ["from-indigo-500 to-blue-600", "from-violet-500 to-fuchsia-600", "from-sky-500 to-cyan-600"][index % 3];
              return <article key={activity.id} className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-[180px_1fr] lg:grid-cols-[42%_1fr]"><div className={`relative min-h-[145px] bg-gradient-to-br ${accent}`}><Image src={BUILDING_ASSETS[category as CategoryId]} alt="" fill sizes="220px" className="object-contain p-3 drop-shadow-lg" /><span className="absolute left-3 top-3 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-bold text-white">{activity.minutes ?? 60} 分</span></div><div className="flex flex-col p-4"><span className="text-[10px] font-bold text-indigo-500">{building?.category ?? "學習精華"}</span><h3 className="mt-2 line-clamp-2 text-sm font-black">{activity.title.replace("觀看《", "").replace("》", "")}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">整理本週重要觀念，利用短時間重新掌握學習重點。</p><Link href={reviewHref("highlights", category as CategoryId)} className="mt-auto flex w-fit items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-600">快速回顧<ArrowRight className="h-3.5 w-3.5" /></Link></div></article>;
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-white/80 bg-white/95 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black">本週學習足跡</h2><p className="mt-1 text-xs text-slate-400">每一步累積，都讓學習城市持續成長</p></div><Link href="/timeline" className="flex items-center gap-1 text-xs font-bold text-indigo-600">查看全部<ChevronRight className="h-4 w-4" /></Link></div>
          <div className="divide-y divide-slate-100">
            {(weekActivities.length ? weekActivities : state.activity.slice(0, 5)).slice(0, 6).map((activity, index) => {
              const meta = activityMeta[activity.type];
              const Icon = meta.icon;
              return <div key={activity.id} className="grid items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[90px_minmax(220px,1.1fr)_110px_minmax(240px,1fr)_80px_18px] sm:px-6"><div className="flex items-center gap-3 text-xs font-bold text-slate-500"><span className="text-center">{new Date(`${activity.date}T12:00:00`).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}<span className="block text-[10px] font-medium text-slate-400">{["20:45", "17:10", "21:32", "19:08", "16:50"][index % 5]}</span></span><span className="hidden h-2 w-2 rounded-full border-2 border-indigo-200 bg-white sm:block" /></div><div className="flex min-w-0 items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.className}`}><Icon className="h-4 w-4" /></span><p className="truncate text-sm font-bold">{activity.title}</p></div><span className={`w-fit rounded-lg px-2 py-1 text-[10px] font-bold ${meta.className}`}>{meta.label}</span><p className="hidden truncate text-xs text-slate-400 sm:block">{activity.type === "upgrade" ? "完成升級任務，解鎖更多學習資源。" : "完成今日學習活動，持續累積知識與進度。"}</p><span className="text-right text-sm font-black text-indigo-600">+{meta.xp} XP</span><ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" /></div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
