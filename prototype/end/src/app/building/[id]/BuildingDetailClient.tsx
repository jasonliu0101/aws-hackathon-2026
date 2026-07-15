"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  House,
  Medal,
  Play,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type { CategoryId, Course } from "@/types";
import { useStore } from "@/lib/store";
import { minutesToNextLevel, nextLevelThreshold } from "@/lib/xp";
import { midUrl } from "@/lib/flow";
import { Progress } from "@/components/ui/progress";
import { SuccessModal, type SuccessInfo } from "@/components/common/SuccessModal";
import { formatMinutes } from "@/lib/utils";
import { BUILDING_ASSETS } from "@/lib/building-assets";
import { asset } from "@/lib/asset";
import { reviewHref, taskHref } from "@/lib/routes";

const BUILDING_COPY: Record<CategoryId, { tagline: string; description: string; suggestion: string }> = {
  investing: { tagline: "學習理財知識，累積你的財富能力！", description: "在這裡學習投資策略、\n資產配置與風險管理，\n打造你的財富未來！", suggestion: "今天適合先複習「ETF 風險分散」" },
  career: { tagline: "精進職場能力，打造理想工作生涯！", description: "從溝通協作到專案管理，\n累積能立即運用的職場技能。", suggestion: "今天適合複習「需求訪談情境」" },
  language: { tagline: "每天累積一點，讓語言成為你的力量！", description: "用情境練習與重點複習，\n建立自然又實用的語言能力。", suggestion: "今天適合複習「日常禮貌用語」" },
  baking: { tagline: "從基礎技巧開始，做出療癒好味道！", description: "掌握食材特性與烘焙技巧，\n一步步完成自己的美味作品。", suggestion: "今天適合複習「麵糊攪拌技巧」" },
  beauty: { tagline: "探索藝術文化，豐富你的生活視野！", description: "從創作欣賞到文化觀察，\n建立屬於你的藝文品味。", suggestion: "今天適合複習「作品觀察方法」" },
  fitness: { tagline: "建立正確習慣，讓健康持續升級！", description: "學習安全有效的訓練方法，\n打造適合自己的健康節奏。", suggestion: "今天適合複習「深蹲動作要領」" },
  lifestyle: { tagline: "把所學帶進日常，創造喜歡的生活！", description: "從整理、風格到生活靈感，\n練習更有質感的日常選擇。", suggestion: "今天適合複習「生活整理原則」" },
  digital: { tagline: "掌握行銷工具，讓好內容被更多人看見！", description: "從內容策略到數位工具，\n累積可實作的行銷能力。", suggestion: "今天適合複習「受眾洞察方法」" },
};

const TOOL_CARDS = [
  { tool: "quiz" as const, img: "/assets/icons/task-list.png", title: "測驗", description: "檢查理解程度，\n鞏固學習成果", action: "開始測驗" },
  { tool: "flashcards" as const, img: "/assets/icons/flashcard.png", title: "學習卡", description: "複習重點概念，\n強化記憶", action: "開始複習" },
  { tool: "notes" as const, img: "/assets/icons/notebook.png", title: "筆記", description: "整理學習重點，\n建立知識架構", action: "查看筆記" },
  { tool: "highlights" as const, img: "/assets/icons/video-play.png", title: "課程精華", description: "快速複習重點，\n節省學習時間", action: "查看精華" },
];

export function BuildingDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const building = state.buildings.find((item) => item.id === params.id);
  const categoryId = params.id as CategoryId;
  const courses = useMemo(() => state.courses.filter((course) => course.category === categoryId), [state.courses, categoryId]);
  const tasks = useMemo(() => state.tasks.filter((task) => task.buildingId === categoryId).slice(0, 2), [state.tasks, categoryId]);

  if (!building) {
    return <div className="building-detail-page grid min-h-[60vh] place-items-center"><button className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white" onClick={() => router.push("/")}>回到城市</button></div>;
  }

  const copy = BUILDING_COPY[building.id];
  const currentCourse = courses.find((course) => course.status === "in-progress" && course.progress > 0);
  const toNext = minutesToNextLevel(building.minutes);
  const threshold = nextLevelThreshold(building.minutes);
  const progress = threshold ? Math.min(100, (building.minutes / threshold) * 100) : 100;
  const completedChapters = Math.max(building.chaptersDone, 1);
  const chapterGoal = Math.max(completedChapters + 6, 12);

  // 「繼續學習」= 前往 mid 播放器（真正的學習在那裡），不再本地模擬觀看。
  function watch(course: Course) {
    const minutes = Math.min(course.minutesLeft || 5, 5);
    dispatch({ type: "WATCH_COURSE", courseId: course.id, minutes });
    setTimeout(() => { window.location.href = midUrl(); }, 60);
  }

  return (
    <div className="building-detail-page app-page-bg min-h-screen px-3 py-4 text-slate-900 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[1380px] space-y-4">
        <header className="grid min-h-[78px] items-center gap-3 rounded-[22px] border border-white/80 bg-white/95 px-4 py-3 shadow-[0_14px_35px_-24px_rgba(30,64,175,.45)] md:grid-cols-[1fr_auto_1fr] md:px-6">
          <button onClick={() => router.push("/")} className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"><ArrowLeft className="h-4 w-4" />返回城市</button>
          <div className="flex items-center gap-3 md:justify-self-center">
            <div className="relative h-14 w-14"><Image src={BUILDING_ASSETS[building.id]} alt="" fill sizes="56px" className="object-contain drop-shadow-md" /></div>
            <div><h1 className="text-xl font-black tracking-tight">{building.name}</h1><p className="text-xs font-medium text-slate-500">{copy.tagline}</p></div>
          </div>
          <div className="flex items-center gap-2 md:justify-self-end">
            <span className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 font-black text-indigo-950"><Medal className="h-6 w-6 text-indigo-600" />Lv.{building.level}</span>
            <button onClick={() => router.push("/")} aria-label="回到城市首頁" title="回到城市首頁" className="grid h-11 w-11 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100"><House className="h-5 w-5" /></button>
          </div>
        </header>

        <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.9fr)]">
          <div className="relative min-h-[330px] overflow-hidden rounded-[22px] border border-white/80 bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-50 shadow-sm">
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_25%,white_0_4%,transparent_5%),radial-gradient(circle_at_80%_18%,white_0_6%,transparent_7%)]" />
            <div className="relative z-10 max-w-[280px] p-6 sm:p-8">
              <h2 className="text-3xl font-black tracking-tight">{building.name}</h2>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-600"><BookOpen className="h-4 w-4" />{building.category}</span>
              <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-7 text-slate-700">{copy.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-xs shadow-sm"><Trophy className="h-5 w-5 text-amber-500" /><span><span className="block text-slate-500">今日可獲得</span><strong>+20 XP</strong></span></div>
            </div>
            <div className="absolute bottom-[-7%] right-[-2%] h-[92%] w-[68%] sm:right-[2%] sm:w-[62%]"><Image src={BUILDING_ASSETS[building.id]} alt={building.name} fill priority sizes="(max-width: 1024px) 65vw, 50vw" className="object-contain object-bottom drop-shadow-[0_24px_18px_rgba(30,64,175,.2)]" /></div>
          </div>

          <div className="h-full rounded-[22px] border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { img: "/assets/icons/clock.png", label: "學習時間", value: formatMinutes(building.minutes), sub: "累積學習時間" },
                { img: "/assets/badges/course-complete.png", label: "完成章節", value: `${completedChapters} / ${chapterGoal}`, sub: "已完成章節" },
                { img: "/assets/badges/level-badge.png", label: "目前等級", value: `Lv.${building.level}`, sub: building.level >= 4 ? "進階學習者" : "持續成長中" },
              ].map(({ img, label, value, sub }) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="relative mb-3 h-12 w-12"><Image src={asset(img)} alt={label} fill sizes="48px" className="object-contain" /></div><div className="text-xs font-bold text-slate-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div><div className="mt-1 text-[11px] text-slate-400">{sub}</div></div>)}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-100 p-5">
              <div className="flex items-end justify-between gap-3 text-xs font-semibold text-slate-600"><span>{toNext === null ? "已達目前最高等級" : `距離下一級還差 ${formatMinutes(toNext)}`}</span><span>{building.minutes.toLocaleString()} / {threshold?.toLocaleString() ?? building.minutes.toLocaleString()} 學習值</span></div>
              <div className="mt-3 flex items-center gap-4"><Progress value={progress} className="h-3 flex-1 bg-slate-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-violet-600" /><Trophy className="h-10 w-10 text-amber-500" /></div>
            </div>
          </div>
        </section>

        <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.9fr)]">
          <div className="flex flex-col gap-4 xl:contents">
            <div className="h-full rounded-[22px] border border-white/80 bg-white/95 p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-1">
              <div className="mb-4 flex items-center gap-3"><Sparkles className="h-5 w-5 text-indigo-500" /><h2 className="text-lg font-black">複習工具</h2><span className="text-xs text-slate-400">善用工具，加強學習效果！</span></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TOOL_CARDS.map(({ tool, img, title, description, action }) => <button key={tool} onClick={() => router.push(reviewHref(tool, building.id))} className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"><span className="relative mx-auto block h-16 w-16 transition duration-200 group-hover:scale-110"><Image src={asset(img)} alt={title} fill sizes="64px" className="object-contain" /></span><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">{description}</p><span className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-bold text-indigo-600 transition group-hover:bg-indigo-50">{action}<ArrowRight className="h-3.5 w-3.5" /></span></button>)}
              </div>
            </div>

            <div className="h-full rounded-[22px] border border-white/80 bg-white/95 p-5 shadow-sm sm:p-6 xl:col-start-1 xl:row-start-2">
              <div className="mb-3 flex items-center gap-3"><Target className="h-5 w-5 text-rose-500" /><h2 className="text-lg font-black">學習任務</h2><span className="text-xs text-slate-400">完成任務，獲得更多經驗值！</span></div>
              <div className="space-y-2">
                {tasks.length ? tasks.map((task) => <div key={task.id} className="grid items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[1fr_120px_100px]"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><CheckCircle2 className="h-5 w-5" /></span><div><div className="text-sm font-black">{task.title}</div><div className="text-[11px] text-slate-400">與今日個人化任務同步</div></div></div><div className="flex items-center gap-2 text-sm font-black text-slate-700"><Medal className="h-5 w-5 text-amber-500" />+{task.xp} XP</div><button disabled={task.done} onClick={() => router.push(taskHref(building.id, task.id))} className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300">{task.done ? "已完成" : "前往任務"}</button></div>) : <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">今天沒有這個領域的任務，可到每日任務查看 AI 安排。</div>}
              </div>
              <button onClick={() => router.push(taskHref())} className="mx-auto mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">查看全部任務<ChevronDown className="h-4 w-4" /></button>
            </div>
          </div>

          <aside className="flex flex-col gap-4 xl:contents">
            <div className="h-full rounded-[22px] border border-white/80 bg-white/95 p-5 shadow-sm xl:col-start-2 xl:row-start-1">
              <div className="mb-4 flex items-center gap-3"><Play className="h-5 w-5 fill-blue-500 text-blue-500" /><h2 className="text-lg font-black">接續播放</h2><span className="text-xs text-slate-400">從上次離開的地方繼續學習吧！</span></div>
              {currentCourse ? <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-3"><div className="flex gap-3"><div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700"><Image src={BUILDING_ASSETS[building.id]} alt="" fill sizes="128px" className="object-contain p-2 opacity-90" /></div><div className="min-w-0 flex-1"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-indigo-600">{building.category}系列</span><h3 className="mt-3 truncate font-black">{currentCourse.title}</h3><p className="mt-2 truncate text-xs text-slate-500">{currentCourse.resumePoint ?? `剩下 ${currentCourse.minutesLeft} 分鐘`}</p><Progress value={currentCourse.progress} className="mt-3 h-2 bg-white" /></div></div><button onClick={() => watch(currentCourse)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white"><Play className="h-4 w-4 fill-current" />繼續學習</button></div> : <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 text-center"><div className="relative mx-auto h-28 w-32"><Image src={BUILDING_ASSETS[building.id]} alt="" fill sizes="128px" className="object-contain drop-shadow-md" /></div><h3 className="mt-2 font-black">開始新的{building.category}學習</h3><p className="mt-1 text-xs leading-5 text-slate-500">目前沒有可接續的進度，挑一門相關課程開始探索吧。</p><button onClick={() => router.push(`/courses?category=${building.id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white"><Play className="h-4 w-4 fill-current" />開始新學習</button></div>}
            </div>

            <div className="relative h-full min-h-[180px] overflow-hidden rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-5 shadow-sm xl:col-start-2 xl:row-start-2">
              <div className="relative z-10">
                <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-600" /><h2 className="font-black">AI 助教的學習成效摘要</h2></div>
                <div className="mt-3 max-w-[80%] space-y-1 text-sm leading-7 text-slate-700">
                  <p className="font-black text-slate-900">最近你的學習很有主題性 👏</p>
                  <p>你在行銷研究所學了 <strong className="font-black text-violet-600">AGI 提升工作效率</strong></p>
                  <p>在財富銀行學了 <strong className="font-black text-violet-600">小資族 ETF 投資入門</strong></p>
                  <p className="whitespace-nowrap">持續深耕 <strong className="font-black text-slate-950">投資、行銷</strong> 領域，這些內容正一點一點長成你的養分</p>
                  <p>想再深化哪個主題，AI 助教都能幫你安排下一步！</p>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-3 right-3 h-20 w-20"><Image src={asset("/assets/icons/ai-robot.png")} alt="AI 助教" fill sizes="80px" className="object-contain drop-shadow-lg" /></div>
            </div>
          </aside>
        </section>
      </div>

      <SuccessModal info={success} onClose={() => setSuccess(null)} />
    </div>
  );
}
