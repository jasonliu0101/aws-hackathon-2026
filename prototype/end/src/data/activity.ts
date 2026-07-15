import type { ActivityEntry } from "@/types";

/** 10 recent learning-record entries for the timeline. Newest first. */
export const seedActivity: ActivityEntry[] = [
  { id: "a1", date: "2026-07-13", type: "watch", title: "觀看《AI 工具提升工作效率》", minutes: 22, category: "digital" },
  { id: "a2", date: "2026-07-13", type: "upgrade", title: "數位科技中心升上 Level 3", category: "digital" },
  { id: "a3", date: "2026-07-13", type: "watch", title: "觀看《小資族 ETF 投資入門》", minutes: 18, category: "investing" },
  { id: "a4", date: "2026-07-11", type: "quiz", title: "完成 3 題需求訪談測驗", category: "career" },
  { id: "a5", date: "2026-07-11", type: "watch", title: "觀看《產品經理的需求訪談術》", minutes: 25, category: "career" },
  { id: "a6", date: "2026-07-09", type: "note", title: "為《新手居家烘焙》新增學習筆記", category: "baking" },
  { id: "a7", date: "2026-07-09", type: "watch", title: "觀看《新手居家烘焙》", minutes: 15, category: "baking" },
  { id: "a8", date: "2026-07-06", type: "review", title: "完成一組 ETF 學習卡複習", category: "investing" },
  { id: "a9", date: "2026-06-28", type: "watch", title: "完成《看懂財報的第一堂課》", minutes: 40, category: "investing" },
  { id: "a10", date: "2026-06-20", type: "watch", title: "完成《職場簡報表達力》", minutes: 35, category: "career" },
];
