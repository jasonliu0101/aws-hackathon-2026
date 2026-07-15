"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { CategoryId, Course } from "@/types";
import { useStore } from "@/lib/store";
import { recommendNextReview } from "@/lib/ai";
import { midUrl } from "@/lib/flow";
import { CourseCard } from "@/components/courses/CourseCard";
import { SuccessModal, type SuccessInfo } from "@/components/common/SuccessModal";
import { Card, CardContent } from "@/components/ui/card";

type Filter = "in-progress" | "review" | "completed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "in-progress", label: "正在學習" },
  { id: "review", label: "待複習" },
  { id: "completed", label: "已完成" },
];

export default function CoursesPage() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<Filter>("in-progress");
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [reco, setReco] = useState<string>("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [sourceTaskId, setSourceTaskId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category") as CategoryId | null;
    if (requestedCategory && state.buildings.some((building) => building.id === requestedCategory)) setCategory(requestedCategory);
    setSourceTaskId(params.get("task"));
  }, [state.buildings]);

  useEffect(() => {
    recommendNextReview(state.courses).then(setReco);
  }, [state.courses]);

  const list = useMemo(() => {
    if (filter === "completed")
      return state.courses.filter((c) => c.status === "completed" && (category === "all" || c.category === category));
    if (filter === "review")
      return state.courses.filter(
        (c) => c.status === "in-progress" && c.progress >= 50 && (category === "all" || c.category === category),
      );
    return state.courses.filter((c) => c.status === "in-progress" && (category === "all" || c.category === category));
  }, [state.courses, filter, category]);

  // 「繼續學習」= 前往 mid 的 PPA 播放器（真正的學習發生在那裡），不再本地模擬觀看。
  function watch(course: Course) {
    const mins = Math.min(course.minutesLeft || 5, 5);
    dispatch({ type: "WATCH_COURSE", courseId: course.id, minutes: mins });
    const sourceTask = state.tasks.find((task) => task.id === sourceTaskId && !task.done && task.kind === "watch");
    if (sourceTask) {
      dispatch({ type: "COMPLETE_TASK", taskId: sourceTask.id });
      setSourceTaskId(null);
    }
    // 讓 reducer 的 localStorage 持久化先跑完，再跳頁
    setTimeout(() => { window.location.href = midUrl(); }, 60);
  }

  return (
    <div className="app-page-bg min-h-screen px-3 py-5 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-3xl space-y-5 rounded-[26px] border border-white/80 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h1 className="text-2xl font-bold">我的課程</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理你正在學、待複習與已完成的課程。
        </p>
      </div>

      {/* AI recommended next step */}
      <Card className="border-brand-sky/40 bg-brand-sky/5">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-sky/15 text-brand-sky">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold text-brand-sky">
              AI 推薦下一步
            </div>
            <p className="text-sm">{reco || "分析中…"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
              (filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button onClick={() => setCategory("all")} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${category === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>全部領域</button>
        {state.buildings.map((building) => <button key={building.id} onClick={() => setCategory(building.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${category === building.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>{building.category}</button>)}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            building={state.buildings.find((b) => b.id === c.category)}
            onWatch={watch}
          />
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          這個分類目前沒有課程。
        </p>
      )}

      <SuccessModal info={success} onClose={() => setSuccess(null)} />
      </div>
    </div>
  );
}
