import type { DailyTask } from "@/types";

/**
 * Daily tasks are intentionally short (3–10 min) and singular in focus.
 * The Today page surfaces only ONE at a time to avoid task overload.
 */
export const seedTasks: DailyTask[] = [
  {
    id: "t1",
    kind: "review",
    title: "花 3 分鐘複習昨天學過的三個 ETF 觀念",
    estMinutes: 3,
    purpose: "趁記憶還新鮮時鞏固，隔天複習能大幅提升長期記憶。",
    reward: "學習卡工坊獲得 20 點建設值",
    xp: 20,
    coins: 30,
    buildingId: "investing",
    done: false,
  },
  {
    id: "t2",
    kind: "watch",
    title: "看完《ETF 投資入門》剩下的 4 分鐘完成本章",
    estMinutes: 4,
    purpose: "只差一小段就能完成整個章節，投資銀行即將升級。",
    reward: "投資銀行獲得 24 點建設值",
    xp: 24,
    coins: 36,
    buildingId: "investing",
    done: false,
  },
  {
    id: "t3",
    kind: "quiz",
    title: "回答一題需求訪談的小測驗",
    estMinutes: 2,
    purpose: "用測驗檢查自己是否真的理解，比重看一次更有效。",
    reward: "職場辦公大樓獲得 5 點建設值",
    xp: 5,
    coins: 10,
    buildingId: "career",
    done: false,
  },
  {
    id: "t4",
    kind: "note",
    title: "為《AI 工具提升工作效率》寫一句學習筆記",
    estMinutes: 3,
    purpose: "用自己的話寫下來，是把知識變成能力的關鍵一步。",
    reward: "數位科技中心獲得 10 點建設值",
    xp: 10,
    coins: 15,
    buildingId: "digital",
    done: false,
  },
];
