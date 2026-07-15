"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  Check,
  CheckCheck,
  Megaphone,
  RotateCcw,
} from "lucide-react";
import type { ReturnNotification } from "@/types";
import { seedNotifications } from "@/data/notifications";
import { useStore } from "@/lib/store";
import { reviewHref } from "@/lib/routes";
import { asset } from "@/lib/asset";

type FilterId = "all" | "task" | "review" | "system";

function notificationHref(notification: ReturnNotification) {
  const category = notification.category ?? "investing";
  if (notification.target === "quiz") return reviewHref("quiz", category);
  if (notification.target === "notes") return reviewHref("notes", category);
  if (notification.target === "flashcards") return reviewHref("flashcards", category);
  if (notification.target === "highlight") return reviewHref("highlights", category);
  if (notification.target === "task") return "/tasks";
  return `/courses?category=${category}`;
}

const NOTIFICATION_UI: Record<string, {
  title: string;
  category: Exclude<FilterId, "all">;
  img: string;
  tone: "indigo" | "amber" | "sky" | "violet" | "emerald";
  time: string;
}> = {
  n1: { title: "你的城市昨天又長高了一點！", category: "task", img: "/assets/badges/level-badge.png", tone: "indigo", time: "約 5 分鐘前" },
  n2: { title: "還記得昨天的「ETF 風險分散」嗎？", category: "task", img: "/assets/icons/video-play.png", tone: "sky", time: "約 2 小時前" },
  n3: { title: "AI 助教幫你整理好了！", category: "review", img: "/assets/icons/notebook.png", tone: "sky", time: "約 1 天前" },
  n4: { title: "上次學到哪裡，AI 助教還記得。", category: "review", img: "/assets/icons/video-play.png", tone: "violet", time: "3 天前" },
  n5: { title: "先不用急著繼續上課", category: "task", img: "/assets/icons/task-list.png", tone: "amber", time: "5 天前" },
  n6: { title: "「資產配置」好像還有一點模糊？", category: "review", img: "/assets/icons/flashcard.png", tone: "emerald", time: "7 天前" },
  n7: { title: "好久不見！你的城市一直都在", category: "system", img: "/assets/icons/ai-robot.png", tone: "violet", time: "10 天前" },
  n8: { title: "你已經在學習城市累積 1,280 分鐘了！", category: "task", img: "/assets/icons/clock.png", tone: "amber", time: "14 天前" },
  n9: { title: "原本的課程不適合現在的你，也沒關係", category: "system", img: "/assets/icons/ai-robot.png", tone: "indigo", time: "超過 2 週前" },
};

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "全部" },
  { id: "task", label: "學習任務" },
  { id: "system", label: "系統通知" },
];

const TONE_STYLE = {
  indigo: { icon: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-50 text-indigo-600", action: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100", wash: "from-indigo-50/80" },
  amber: { icon: "bg-amber-100 text-amber-600", badge: "bg-amber-50 text-amber-700", action: "bg-amber-50 text-amber-700 hover:bg-amber-100", wash: "from-amber-50/80" },
  sky: { icon: "bg-sky-100 text-sky-600", badge: "bg-sky-50 text-sky-600", action: "bg-sky-50 text-sky-600 hover:bg-sky-100", wash: "from-sky-50/80" },
  violet: { icon: "bg-violet-100 text-violet-600", badge: "bg-violet-50 text-violet-600", action: "bg-violet-50 text-violet-600 hover:bg-violet-100", wash: "from-violet-50/80" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-50 text-emerald-600", action: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", wash: "from-emerald-50/80" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<FilterId>("all");
  const [unreadIds, setUnreadIds] = useState(() => new Set(seedNotifications.slice(0, 5).map((item) => item.id)));
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const notifications = useMemo(() => seedNotifications.filter((item) => filter === "all" || NOTIFICATION_UI[item.id].category === filter), [filter]);
  const counts = useMemo(() => ({
    all: unreadIds.size,
    task: seedNotifications.filter((item) => unreadIds.has(item.id) && NOTIFICATION_UI[item.id].category === "task").length,
    review: seedNotifications.filter((item) => unreadIds.has(item.id) && NOTIFICATION_UI[item.id].category === "review").length,
    system: seedNotifications.filter((item) => unreadIds.has(item.id) && NOTIFICATION_UI[item.id].category === "system").length,
  }), [unreadIds]);

  function markRead(id: string) {
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function openNotification(notification: ReturnNotification) {
    const wasUnread = unreadIds.has(notification.id);
    markRead(notification.id);
    if (wasUnread && notification.tier !== "short") dispatch({ type: "COMEBACK_BONUS", sourceId: notification.id });
    router.push(notificationHref(notification));
  }

  return (
    <div className="app-page-bg min-h-screen px-3 py-5 text-slate-900 sm:px-5 lg:px-7 lg:py-7">
      <div className="mx-auto grid max-w-[1380px] items-start gap-4 lg:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="relative min-h-[210px] overflow-hidden rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-6 shadow-sm">
            <div className="relative z-10 max-w-[200px]"><p className="text-xl font-black">小學伴</p><p className="mt-2 text-base font-semibold leading-7 text-slate-600">你有 {counts.all} 個新的學習提醒，挑一件最適合現在的開始吧！</p><button onClick={() => router.push("/tasks")} className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200">查看今日任務<ArrowRight className="h-4 w-4" /></button></div>
            <div className="absolute bottom-4 right-4 h-28 w-28"><Image src={asset("/assets/icons/ai-robot.png")} alt="小學伴" fill sizes="112px" className="object-contain drop-shadow-xl" /></div>
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-sm">
            <h2 className="font-black">通知總覽</h2>
            <div className="mt-4 space-y-2">
              {[
                { id: "all" as const, label: "未讀通知", icon: Bell, tone: "bg-indigo-50 text-indigo-600" },
                { id: "task" as const, label: "學習任務提醒", icon: BookOpenCheck, tone: "bg-emerald-50 text-emerald-600" },
                { id: "system" as const, label: "系統通知", icon: Megaphone, tone: "bg-violet-50 text-violet-600" },
              ].map(({ id, label, icon: Icon, tone }) => <button key={id} onClick={() => setFilter(id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${filter === id ? "bg-slate-50 ring-1 ring-indigo-100" : "hover:bg-slate-50"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span><span className="flex-1 text-sm font-bold">{label}</span><span className="grid min-w-6 place-items-center rounded-full bg-indigo-100 px-1.5 py-1 text-[10px] font-black text-indigo-600">{counts[id]}</span></button>)}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-sm font-black">接收學習提醒與建議</h2><p className="mt-1 text-[11px] leading-5 text-slate-400">關閉後不會顯示新的學習提醒</p></div><button role="switch" aria-checked={remindersEnabled} aria-label="接收學習提醒與建議" onClick={() => setRemindersEnabled((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${remindersEnabled ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${remindersEnabled ? "left-6" : "left-1"}`} /></button></div>
          </section>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-[22px] border border-white/80 bg-white/90 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {FILTERS.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-black transition ${filter === item.id ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{item.label}</button>)}
            </div>
            <button onClick={() => setUnreadIds(new Set())} disabled={unreadIds.size === 0} className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:text-slate-300"><CheckCheck className="h-4 w-4" />全部標記為已讀</button>
          </div>

          {!remindersEnabled && <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"><Bell className="h-5 w-5" />學習提醒目前已關閉；既有通知仍可查看。</div>}

          <div className="space-y-3">
            {notifications.map((notification) => {
              const ui = NOTIFICATION_UI[notification.id];
              const style = TONE_STYLE[ui.tone];
              const unread = unreadIds.has(notification.id);
              return <article key={notification.id} className={`relative overflow-hidden rounded-[22px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${unread ? `border-indigo-100 bg-gradient-to-r ${style.wash} to-white` : "border-slate-200 bg-slate-100/70"}`}>
                <div className="grid items-center gap-4 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/70 shadow-sm ${unread ? "" : "opacity-70"}`}><span className="relative h-11 w-11"><Image src={asset(ui.img)} alt="" fill sizes="44px" className={`object-contain ${unread ? "" : "grayscale"}`} /></span></span>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h2 className={`text-lg font-black sm:text-xl ${unread ? "" : "text-slate-400"}`}>{ui.title}</h2><span className="text-xs font-medium text-slate-400">{ui.time}</span>{unread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" /> : <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><Check className="h-3 w-3" />已讀</span>}</div><p className={`mt-1.5 text-base leading-7 ${unread ? "text-slate-600" : "text-slate-400"}`}>{notification.body}</p></div>
                  <div className="flex gap-2 sm:flex-col"><button onClick={() => openNotification(notification)} className={`flex min-w-[118px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition sm:flex-none ${unread ? style.action : "bg-slate-200/70 text-slate-500 hover:bg-slate-200"}`}>{notification.cta}<ArrowRight className="h-4 w-4" /></button></div>
                </div>
              </article>;
            })}
          </div>

          {notifications.length === 0 && <div className="rounded-[22px] border border-white/80 bg-white/90 p-14 text-center shadow-sm"><CheckCheck className="mx-auto h-10 w-10 text-emerald-500" /><p className="mt-4 font-black">這個分類目前沒有通知</p><p className="mt-1 text-sm text-slate-400">新的學習消息會顯示在這裡。</p></div>}
          <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-slate-400"><RotateCcw className="h-3.5 w-3.5" />已顯示近期所有通知・目前 XP {state.user.xp.toLocaleString()}</div>
        </main>
      </div>
    </div>
  );
}
