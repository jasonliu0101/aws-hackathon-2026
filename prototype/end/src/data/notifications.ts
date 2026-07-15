import type { ReturnNotification } from "@/types";

/**
 * Catch-up notifications. Note the deliberate design: no guilt, no streak loss.
 * Copy always answers: where you stopped, why it's low-effort, what to do now.
 * Grouped by recall window — short (數分鐘~1天), mid (3~7天), long (超過一週).
 */
export const seedNotifications: ReturnNotification[] = [
  // 短期召回
  {
    id: "n1",
    tier: "short",
    timeframe: "約 5 分鐘前",
    body: "再學習 3 分鐘，投資銀行就能獲得 20 XP，離升級更近一步。",
    cta: "繼續建設",
    target: "resume",
    category: "investing",
  },
  {
    id: "n2",
    tier: "short",
    timeframe: "約 2 小時前",
    body: "你只剩下 4 分鐘就能完成這一章，AI 助教已經幫你接好進度。",
    cta: "從上次位置繼續",
    target: "resume",
    category: "investing",
  },
  {
    id: "n3",
    tier: "short",
    timeframe: "約 1 天前",
    body: "《小資族 ETF 投資入門》的三個重要觀念，只要 60 秒就能快速想起來。",
    cta: "快速複習",
    target: "highlight",
    category: "investing",
  },
  // 中期召回｜3～7 天
  {
    id: "n4",
    tier: "mid",
    timeframe: "3 天前",
    body: "我們把你停下來前的內容整理成一段 90 秒精華，不用重新看完整章節。",
    cta: "播放課程精華",
    target: "highlight",
    category: "investing",
  },
  {
    id: "n5",
    tier: "mid",
    timeframe: "5 天前",
    body: "AI 助教從你上次的內容出了一題小測驗，回答完就能找回學習狀態。",
    cta: "回答一題",
    target: "quiz",
    category: "investing",
  },
  {
    id: "n6",
    tier: "mid",
    timeframe: "7 天前",
    body: "AI 助教依照你上次的答題結果，準備了一個更簡單的例子，花 2 分鐘就能補起來。",
    cta: "看看新解釋",
    target: "highlight",
    category: "investing",
  },
  // 長期召回｜超過一週
  {
    id: "n7",
    tier: "long",
    timeframe: "10 天前",
    body: "累積的學習時間、筆記和建築都完整保存著，今天從一張學習卡重新開始就好。",
    cta: "輕鬆回來看看",
    target: "flashcards",
    category: "investing",
  },
  {
    id: "n8",
    tier: "long",
    timeframe: "14 天前",
    body: "這些努力沒有消失，AI 助教準備了一個 3 分鐘回歸任務，陪你接回進度。",
    cta: "開始回歸任務",
    target: "task",
  },
  {
    id: "n9",
    tier: "long",
    timeframe: "超過 2 週前",
    body: "你可以繼續上次進度、先看精華，或讓 AI 助教重新安排更適合的學習任務。",
    cta: "選擇新的下一步",
    target: "task",
  },
];
