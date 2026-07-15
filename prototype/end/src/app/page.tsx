"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { InteractiveCity } from "@/components/city/InteractiveCity";
import Link from "next/link";
import { ArrowRight, Bot, Flame } from "lucide-react";

export default function HomePage() {
  const { state } = useStore();

  const pending = useMemo(() => {
    const cats = new Set(
      state.courses
        .filter((c) => c.status === "in-progress")
        .map((c) => c.category),
    );
    return Array.from(cats);
  }, [state.courses]);

  return (
    <div className="pb-8">
      <section className="homepage-hero grid items-stretch justify-center gap-5 p-4 sm:p-6 lg:grid-cols-[310px_minmax(0,900px)] lg:gap-6 lg:p-8">
        <aside className="flex flex-col gap-4">
          <div className="px-1 py-2 lg:py-5">
            <p className="text-xs font-bold text-indigo-500">2026 年 7 月 15 日 · 星期三</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">早安，{state.user.name}</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">你今天的學習城市已準備好囉！</p>
          </div>

          <div className="min-h-[238px] rounded-[26px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_-28px_rgba(79,70,229,.65)] backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200"><Bot className="h-8 w-8" /></span>
              <div><p className="text-sm font-black text-slate-900">AI 助教小學伴</p><p className="mt-1 text-[11px] font-medium text-slate-500">專屬學習目標已更新</p></div>
            </div>
            <p className="mt-5 rounded-2xl bg-indigo-50 p-4 text-xs font-semibold leading-6 text-slate-600">我根據你的觀看進度、複習狀況與播放中斷紀錄，準備了 {state.tasks.length} 個專屬任務。</p>
            <Link href="/tasks" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-200">查看今日任務 <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="min-h-[170px] rounded-[24px] rounded-b-none border border-slate-100 bg-white/90 p-6 pb-5 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-sm font-black text-slate-900">連續學習天數</p><span className="flex items-center gap-1 text-sm font-black text-orange-500"><Flame className="h-4 w-4 fill-current" /> 7 天</span></div>
            <div className="mt-6 grid grid-cols-7 gap-1.5">{[4,5,6,7,8,9,10].map((day, index) => <div key={day} className="text-center"><span className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${index < 6 ? "bg-orange-50 text-orange-500" : "bg-slate-100 text-slate-300"}`}>{index < 6 ? <Flame className="h-4 w-4 fill-current" /> : "·"}</span><span className="mt-1.5 block text-[9px] font-bold text-slate-400">{day}</span></div>)}</div>
          </div>

          <div className="-mt-4 flex flex-1 flex-col divide-y divide-slate-100 rounded-[24px] rounded-t-none border border-t-0 border-slate-100 bg-white/90 px-5 py-2 shadow-sm">
            {[{ label: "本週學習", value: `${state.user.weekMinutes} 分`, icon: "◷" }, { label: "完成課程", value: `${state.user.coursesCompleted} 堂`, icon: "✓" }, { label: "累積 XP", value: state.user.xp.toLocaleString(), icon: "★" }].map((item) => (
              <div key={item.label} className="flex flex-1 items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-base font-black text-amber-500">{item.icon}</span>
                <p className="flex-1 text-[12px] font-semibold text-slate-400">{item.label}</p>
                <p className="whitespace-nowrap text-base font-extrabold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-[900px] min-w-0 flex-col">
          <div className="mb-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-indigo-500">My city</p><h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900">我的學習城市</h2></div>
          </div>
          <InteractiveCity buildings={state.buildings} pending={pending} />
        </div>
      </section>

    </div>
  );
}
