"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Layers3, Play, Save, Sparkles } from "lucide-react";
import type { CategoryId, Familiarity } from "@/types";
import type { ReviewTool } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Flashcard } from "@/components/review/Flashcard";
import { QuizCard } from "@/components/review/QuizCard";
import { CourseHighlight } from "@/components/review/CourseHighlight";
import { SuccessModal, type SuccessInfo } from "@/components/common/SuccessModal";
import { BUILDING_ASSETS } from "@/lib/building-assets";
import { asset } from "@/lib/asset";

const TOOLS: Array<{ id: ReviewTool; label: string; asset: string }> = [
  { id: "flashcards", label: "學習卡", asset: "/assets/icons/flashcard.webp" },
  { id: "quiz", label: "問題測驗", asset: "/assets/icons/task-list.webp" },
  { id: "notes", label: "學習筆記", asset: "/assets/icons/notebook.webp" },
  { id: "highlights", label: "課程精華", asset: "/assets/icons/video-play.webp" },
];

function isTool(value: string | null): value is ReviewTool {
  return TOOLS.some((tool) => tool.id === value);
}

export default function ReviewPage() {
  const { state, dispatch } = useStore();
  const [tool, setTool] = useState<ReviewTool>("flashcards");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [sourceTaskId, setSourceTaskId] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [courseIdx, setCourseIdx] = useState(0);
  const [note, setNote] = useState("");
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTool = params.get("tool");
    const requestedCategory = params.get("category") as CategoryId | null;
    if (isTool(requestedTool)) setTool(requestedTool);
    if (requestedCategory && state.buildings.some((building) => building.id === requestedCategory)) setCategory(requestedCategory);
    setSourceTaskId(params.get("task"));
  }, [state.buildings]);

  const categoryCourses = useMemo(() => state.courses.filter((course) => category === "all" || course.category === category), [state.courses, category]);
  const courseIds = useMemo(() => new Set(categoryCourses.map((course) => course.id)), [categoryCourses]);
  const cards = state.flashcards.filter((card) => courseIds.has(card.courseId));
  const quizzes = state.quizzes.filter((quiz) => category === "all" || quiz.category === category);
  const highlights = categoryCourses.filter((course) => course.progress > 20);
  const card = cards.length ? cards[cardIdx % cards.length] : null;
  const quiz = quizzes.length ? quizzes[quizIdx % quizzes.length] : null;
  const selectedCourse = highlights.length ? highlights[courseIdx % highlights.length] : null;
  const visibleNotes = state.notes.filter((item) => category === "all" || item.category === category);
  const activeCategory = category === "all" ? state.buildings[0]?.id ?? "investing" : category;

  function completeSourceTask() {
    if (!sourceTaskId) return;
    const task = state.tasks.find((item) => item.id === sourceTaskId && !item.done);
    if (!task) return;
    dispatch({ type: "COMPLETE_TASK", taskId: task.id });
    const building = state.buildings.find((item) => item.id === task.buildingId);
    setSuccess({ xp: task.xp, coins: task.coins, buildingName: building?.name ?? "學習城市", message: "工具練習與每日任務已同步完成。" });
    setSourceTaskId(null);
  }

  function rateCard(value: Familiarity) {
    if (!card) return;
    dispatch({ type: "RATE_FLASHCARD", cardId: card.id, familiarity: value });
    completeSourceTask();
    setCardIdx((index) => index + 1);
  }

  return (
    <div className="app-page-bg min-h-screen px-3 py-5 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <header className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-indigo-500" /><div><h1 className="text-2xl font-black">複習工具</h1><p className="mt-1 text-sm text-slate-500">所有入口都會回到同一套工具與學習紀錄。</p></div></div><div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">{TOOLS.map((item) => <button key={item.id} onClick={() => setTool(item.id)} className={`flex min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition ${tool === item.id ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" : "border border-slate-200 bg-white text-slate-600"}`}><Image src={asset(item.asset)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />{item.label}</button>)}</div></header>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm"><button onClick={() => { setCategory("all"); setCardIdx(0); setQuizIdx(0); }} className={`rounded-xl px-4 py-2 text-xs font-bold ${category === "all" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>全部領域</button>{state.buildings.map((building) => <button key={building.id} onClick={() => { setCategory(building.id); setCardIdx(0); setQuizIdx(0); setCourseIdx(0); }} className={`flex whitespace-nowrap items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${category === building.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-500"}`}><Image src={BUILDING_ASSETS[building.id]} alt="" width={26} height={26} className="h-6 w-6 object-contain" />{building.name}</button>)}</div>

        <main className="rounded-[26px] border border-white/80 bg-white/95 p-5 shadow-sm sm:p-7">
          {tool === "flashcards" && (card ? <div className="mx-auto max-w-2xl"><div className="mb-4 flex justify-between text-xs font-bold text-slate-400"><span>學習卡複習</span><span>{(cardIdx % cards.length) + 1} / {cards.length}</span></div><Flashcard key={card.id} card={card} onRate={rateCard} onExplain={() => setAiHint(`AI 助教：${card.back}。試著先用自己的例子重述一次，再翻回正面確認。`)} />{aiHint && <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-800">{aiHint}</div>}</div> : <EmptyState label="這個領域目前沒有學習卡" />)}
          {tool === "quiz" && (quiz ? <div className="mx-auto max-w-2xl"><div className="mb-4 flex justify-between text-xs font-bold text-slate-400"><span>知識小測驗</span><span>{(quizIdx % quizzes.length) + 1} / {quizzes.length}</span></div><QuizCard key={quiz.id} quiz={quiz} onAnswered={(correct) => { dispatch({ type: "ANSWER_QUIZ", quizId: quiz.id, correct }); completeSourceTask(); }} /><button onClick={() => setQuizIdx((index) => index + 1)} className="mt-4 w-full rounded-xl bg-indigo-50 py-3 text-sm font-black text-indigo-600">下一題</button></div> : <EmptyState label="這個領域目前沒有測驗" />)}
          {tool === "notes" && <div className="mx-auto max-w-2xl"><div className="mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-amber-500" /><h2 className="font-black">新增學習筆記</h2></div><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="用自己的話寫下今天最重要的觀念…" className="min-h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white" /><button disabled={!note.trim()} onClick={() => { dispatch({ type: "ADD_NOTE", note: note.trim(), category: activeCategory }); setNote(""); completeSourceTask(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-black text-white disabled:opacity-40"><Save className="h-4 w-4" />儲存筆記</button><div className="mt-6 space-y-2">{visibleNotes.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm text-slate-600">{item.body}</p><p className="mt-2 text-[10px] font-bold text-slate-400">{state.buildings.find((building) => building.id === item.category)?.name}・{item.createdAt}</p></div>)}</div></div>}
          {tool === "highlights" && (selectedCourse ? <div className="mx-auto max-w-3xl"><CourseHighlight course={selectedCourse} /><div className="mt-4 flex gap-2"><button onClick={() => setCourseIdx((index) => index + 1)} className="flex-1 rounded-xl border border-indigo-200 py-3 text-sm font-black text-indigo-600">下一個精華</button>{sourceTaskId && <button onClick={completeSourceTask} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-black text-white"><CheckCircle2 className="h-4 w-4" />完成本次回顧</button>}</div></div> : <EmptyState label="這個領域目前沒有課程精華" />)}
        </main>
      </div>
      <SuccessModal info={success} onClose={() => setSuccess(null)} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="py-20 text-center"><Play className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 font-bold text-slate-500">{label}</p></div>;
}
