// ============================================================================
// Mock AI layer.
//
// Every function here returns hard-coded / rule-based output but is shaped
// exactly like the real async API we intend to call later (Amazon Bedrock /
// Claude). To go live, replace each function body with a `fetch` to your
// backend endpoint — the signatures and return types can stay identical.
//
// See README → "串接真正的 AI API" for the swap guide.
// ============================================================================

import type {
  Course,
  DailyTask,
  Flashcard,
  NotificationTier,
  Quiz,
  ReturnNotification,
} from "@/types";
import { seedFlashcards, seedQuizzes } from "@/data/review";
import { seedNotifications } from "@/data/notifications";

/** Simulate network latency so the UI can show real loading states. */
function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** 1) Generate 3–5 flashcards from a course transcript. */
export async function generateFlashcards(course: Course): Promise<Flashcard[]> {
  const cards = seedFlashcards.filter((f) => f.courseId === course.id);
  if (cards.length > 0) return delay(cards.slice(0, 5));
  // Fallback: fabricate a plausible card so any course yields output.
  return delay([
    {
      id: `gen-${course.id}`,
      courseId: course.id,
      front: `《${course.title}》的核心觀念是什麼？`,
      back: "（AI 會依課程逐字稿自動生成重點，此處為示範內容。）",
    },
  ]);
}

/** 2) Generate a single multiple-choice question from course content. */
export async function generateQuiz(course: Course): Promise<Quiz> {
  const quiz = seedQuizzes.find((q) => q.courseId === course.id);
  if (quiz) return delay(quiz);
  return delay({
    id: `gen-q-${course.id}`,
    courseId: course.id,
    category: course.category,
    question: `關於《${course.title}》，以下敘述何者正確？`,
    options: ["示範選項 A", "示範選項 B（正確）", "示範選項 C", "示範選項 D"],
    answerIndex: 1,
    explanation: "AI 會依課程內容自動生成題目與解析，此處為示範內容。",
  });
}

/** 3) Summarize a course into a 30–90 second highlight. */
export async function generateCatchupSummary(course: Course): Promise<string[]> {
  const map: Record<string, string[]> = {
    "c-etf": [
      "ETF 一次買進一籃子標的，天然分散風險。",
      "費用率長期會被複利放大，越低越好。",
      "0050 追蹤台灣 50 指數，是新手常見的起點。",
    ],
    "c-pm": [
      "訪談要問過去實際發生的行為，而非假設。",
      "避免引導性問題，才能取得可信資料。",
      "先廣泛探索，再收斂到真正的痛點。",
    ],
    "c-ai": [
      "好的 prompt 要給角色、任務、格式與範例。",
      "先給逐字稿，再要求結構化輸出。",
      "把 AI 當協作者，人負責判斷與收尾。",
    ],
    "c-dental": [
      "貝氏刷牙法讓牙刷與牙齦約呈 45 度角。",
      "刷毛要輕碰牙齒與牙齦交界的牙齦溝。",
      "每兩顆牙來回輕刷約 10 下，完整刷牙至少 2 到 3 分鐘。",
    ],
  };
  return delay(
    map[course.id] ?? [
      `《${course.title}》重點一：示範摘要。`,
      "重點二：AI 會濃縮課程精華。",
      "重點三：60 秒快速喚醒記憶。",
    ],
  );
}

/** 4) Summarize a user's free-text note into key points. */
export async function summarizeLearningNote(note: string): Promise<string[]> {
  const clean = note.trim();
  if (!clean) return delay(["（尚無筆記內容）"]);
  const points = clean
    .split(/[。\n.!?！？]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  return delay(points.length ? points : [clean.slice(0, 40)]);
}

/** 5) Generate today's single main task from watch progress. */
export async function generateDailyTask(course: Course): Promise<DailyTask> {
  return delay({
    id: `daily-${course.id}`,
    kind: "watch",
    title: `花 ${Math.min(course.minutesLeft, 5)} 分鐘完成《${course.title}》目前章節`,
    estMinutes: Math.min(course.minutesLeft, 5),
    purpose: "只差一小段就能完成，城市馬上就能長高。",
    reward: "對應建築獲得建設值",
    xp: Math.min(course.minutesLeft, 5) * 2,
    coins: Math.max(10, Math.min(course.minutesLeft, 5) * 3),
    buildingId: course.category,
    done: false,
  });
}

/** 6) Pick a return notification for a given inactivity tier. */
export async function generateReturnNotification(
  tier: NotificationTier,
): Promise<ReturnNotification> {
  const pool = seedNotifications.filter((n) => n.tier === tier);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? seedNotifications[0];
  return delay(pick, 300);
}

/** 7) Recommend the next review activity from learning history. */
export async function recommendNextReview(courses: Course[]): Promise<string> {
  const inProgress = courses.filter((c) => c.status === "in-progress");
  if (inProgress.length === 0) return delay("你已完成所有課程，試著挑一門新主題探索吧！");
  const target = inProgress.sort((a, b) => b.progress - a.progress)[0];
  return delay(`建議先複習《${target.title}》——你已完成 ${target.progress}%，趁熱鞏固最有效。`);
}
