"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Gauge,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { BUILDING_ASSETS } from "@/lib/building-assets";
import { asset } from "@/lib/asset";
import { taskToolHref } from "@/lib/routes";

const TASK_META = {
  review: { label: "學習卡複習", icon: BookOpenCheck, tone: "bg-violet-100 text-violet-600" },
  watch: { label: "影片學習", icon: Play, tone: "bg-blue-100 text-blue-600" },
  quiz: { label: "知識測驗", icon: CheckCircle2, tone: "bg-amber-100 text-amber-600" },
  note: { label: "學習筆記", icon: FilePenLine, tone: "bg-emerald-100 text-emerald-600" },
};

export default function TasksPage() {
  const { state } = useStore();
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedBuilding(params.get("building"));
    setSelectedTask(params.get("task"));
  }, []);
  const doneCount = state.tasks.filter((task) => task.done).length;
  const totalXp = state.tasks.reduce((sum, task) => sum + task.xp, 0);
  const totalCoins = state.tasks.reduce((sum, task) => sum + task.coins, 0);
  const earnedXp = state.tasks.filter((task) => task.done).reduce((sum, task) => sum + task.xp, 0);
  const earnedCoins = state.tasks.filter((task) => task.done).reduce((sum, task) => sum + task.coins, 0);
  const stalledTask = useMemo(() => state.tasks.find((task) => task.id === "daily-playback-recovery"), [state.tasks]);
  const displayTasks = useMemo(() => {
    if (selectedTask) return state.tasks.filter((task) => task.id === selectedTask);
    if (selectedBuilding) return state.tasks.filter((task) => task.buildingId === selectedBuilding);
    return state.tasks;
  }, [state.tasks, selectedBuilding, selectedTask]);

  return (
    <div className="app-page-bg min-h-screen px-3 py-5 text-slate-900 sm:px-5 lg:px-7 lg:py-7">
      <div className="mx-auto grid max-w-[1380px] items-start gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-5">
          <section className="relative min-h-[315px] overflow-hidden rounded-[26px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-100 p-6 shadow-sm">
            <div className="relative z-10 max-w-[250px]"><div className="flex items-center gap-2 text-indigo-600"><Sparkles className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-[.16em]">AI Personal Plan</span></div><h1 className="mt-4 text-3xl font-black tracking-tight">今天，從適合你的節奏開始</h1><p className="mt-4 text-sm font-semibold leading-7 text-slate-600">我依照你的學習進度、複習狀況，以及影片播放中斷情形，準備了 {state.tasks.length} 個個人化任務。</p></div>
            <div className="absolute bottom-2 right-2 h-44 w-44"><Image src={asset("/assets/icons/ai-robot.png")} alt="AI 助教" fill priority sizes="176px" className="object-contain drop-shadow-[0_18px_16px_rgba(79,70,229,.2)]" /></div>
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400">今日進度</p><p className="mt-1 text-lg font-black">已完成 {doneCount} / {state.tasks.length}</p></div><div className="grid h-14 w-14 place-items-center rounded-full bg-indigo-50 text-lg font-black text-indigo-600">{Math.round((doneCount / Math.max(1, state.tasks.length)) * 100)}%</div></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all" style={{ width: `${(doneCount / Math.max(1, state.tasks.length)) * 100}%` }} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-amber-50 p-4"><Image src={asset("/assets/badges/level-badge.png")} alt="經驗值" width={34} height={34} className="h-9 w-9 object-contain" /><p className="mt-2 text-[11px] font-bold text-slate-500">已獲得經驗值</p><p className="text-lg font-black text-amber-700">{earnedXp} / {totalXp} XP</p></div><div className="rounded-2xl bg-yellow-50 p-4"><Image src={asset("/assets/badges/star-coin.png")} alt="金幣" width={34} height={34} className="h-9 w-9 object-contain" /><p className="mt-2 text-[11px] font-bold text-slate-500">已獲得金幣</p><p className="text-lg font-black text-yellow-700">{earnedCoins} / {totalCoins}</p></div></div>
          </section>

          {stalledTask && !stalledTask.done && <section className="rounded-[24px] border border-sky-100 bg-sky-50/80 p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sky-600"><Gauge className="h-5 w-5" /></span><div><h2 className="text-sm font-black">已調整影片任務</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">偵測到近期播放中斷，因此改成 3 分鐘短任務，並從上次進度接續。</p></div></div></section>}
        </aside>

        <main className="rounded-[26px] border border-white/80 bg-white/95 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-indigo-500">Today&apos;s missions</p><h2 className="mt-1 text-2xl font-black">個人化學習任務</h2><p className="mt-2 text-sm text-slate-500">每個任務完成後，都會立即發放自己的金幣與經驗值。</p></div><div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600"><Trophy className="h-4 w-4" />今天最多可得 {totalXp} XP・{totalCoins} 金幣</div></div>

          <div className="mt-5 space-y-3">
            {displayTasks.map((task) => {
              const meta = TASK_META[task.kind];
              const Icon = meta.icon;
              const building = state.buildings.find((item) => item.id === task.buildingId);
              return <article key={task.id} className={`relative overflow-hidden rounded-[22px] border p-4 transition sm:p-5 ${task.done ? "border-emerald-100 bg-emerald-50/50" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"}`}>
                <div className="grid items-center gap-4 sm:grid-cols-[64px_minmax(0,1fr)_180px]">
                  <div><span className={`grid h-14 w-14 place-items-center rounded-2xl ${task.done ? "bg-emerald-100 text-emerald-600" : meta.tone}`}>{task.done ? <Check className="h-7 w-7" /> : <Icon className="h-7 w-7" />}</span></div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{meta.label}</span>{task.id === "daily-playback-recovery" && <span className="rounded-lg bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">依播放狀況調整</span>}</div><h3 className={`mt-2 text-base font-black sm:text-lg ${task.done ? "text-slate-400 line-through" : ""}`}>{task.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{task.purpose}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-400"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />約 {task.estMinutes} 分鐘</span><span>{building?.name}</span></div></div>
                  <div><div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-slate-50 p-2.5"><span className="flex items-center gap-1 text-xs font-black text-amber-600"><Image src={asset("/assets/badges/level-badge.png")} alt="" width={20} height={20} className="h-5 w-5 object-contain" />+{task.xp} XP</span><span className="h-5 w-px bg-slate-200" /><span className="flex items-center gap-1 text-xs font-black text-yellow-700"><Image src={asset("/assets/badges/star-coin.png")} alt="" width={18} height={18} className="h-4 w-4 object-contain" />+{task.coins}</span></div>{task.done ? <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 py-3 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />獎勵已領取</div> : <button onClick={() => router.push(taskToolHref(task.kind, task.buildingId, task.id))} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-100"><Play className="h-4 w-4" />前往任務工具</button>}</div>
                </div>
              </article>;
            })}
            {displayTasks.length === 0 && <div className="rounded-2xl bg-slate-50 p-10 text-center"><p className="font-black text-slate-600">今天沒有這個領域的任務</p><button onClick={() => { setSelectedBuilding(null); setSelectedTask(null); }} className="mt-3 text-sm font-bold text-indigo-600">查看全部 AI 任務</button></div>}
          </div>
        </main>
      </div>

    </div>
  );
}
