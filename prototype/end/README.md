# 學習城市 Learning City 🏙️

> 把每一次學習，累積成一座屬於你的城市。
> 整合「學習歷程 × 課後複習 × 遊戲化養成」的響應式 Web MVP。

一款靈感類似「記帳城市」的學習產品：使用者每觀看課程、完成複習、回答測驗或撰寫筆記，城市裡對應的建築就會成長。核心理念是——**今天沒登入不會失去任何進度，你學過的一切都會被城市保存下來**，用正向回歸取代懲罰式的連續簽到。

---

## 🚀 快速開始

```bash
cd learning-city
npm install
npm run dev
```

打開 http://localhost:3000 即可。

其他指令：

```bash
npm run build      # 產出正式版
npm run start      # 啟動正式版
npm run typecheck  # TypeScript 型別檢查
npm run lint       # ESLint
```

> 需求：Node.js 18.18+（建議 20 或 22）。

---

## 🧱 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 14（App Router） |
| 語言 | TypeScript（strict） |
| 樣式 | Tailwind CSS |
| UI 元件 | shadcn 風格自建元件（Button / Card / Tabs / Dialog / Progress / Badge） |
| 圖示 | lucide-react |
| 狀態 | React Context + useReducer |
| 儲存 | localStorage（重整後保留進度） |
| 資料 | 全部為前端 Mock Data，無後端 |

> 為避免安裝時的互動式 CLI 與額外相依，UI 基礎元件以 shadcn/ui 的相同 API 風格手寫於 `src/components/ui/`，之後仍可無痛替換成官方 shadcn/ui 元件。

---

## 📁 專案結構

```
src/
├── app/                    # 頁面（App Router）
│   ├── page.tsx            # 城市首頁
│   ├── tasks/              # 今日任務（一次一個）
│   ├── review/             # 複習中心（記憶卡 / 測驗 / 精華）
│   ├── courses/            # 課程列表
│   ├── timeline/           # 學習紀錄時間軸
│   ├── notifications/      # 召回通知預覽
│   └── building/[id]/      # 建築詳情
├── components/
│   ├── ui/                 # 可重用基礎元件（shadcn 風格）
│   ├── city/               # CityScene, BuildingTile
│   ├── learning/           # StatsHeader, TodayTask, ContinueLearning…
│   ├── review/             # Flashcard, QuizCard, CourseHighlight
│   ├── courses/            # CourseCard
│   ├── notifications/      # NotificationPreview
│   ├── common/             # SuccessModal, XpBar, LevelBadge
│   └── layout/             # AppShell（含桌機/手機導覽）
├── data/                   # Mock 資料（user, buildings, courses…）
├── lib/                    # 邏輯層
│   ├── store.tsx           # 全域狀態 + localStorage
│   ├── ai.ts               # 模擬 AI（可替換成真 API）
│   ├── xp.ts               # XP 與建築升級規則
│   └── utils.ts            # cn() 與格式化工具
└── types/                  # 全域型別定義
```

---

## 🎮 產品機制

### 8 棟建築（對應 8 種學習分類）

投資銀行、職場辦公大樓、語言學院、烘焙工坊、美妝沙龍、健身房、生活創意館、數位科技中心。首次觀看該分類課程後建築才會出現；累積學習時間越多，建築等級越高（Lv.1 → Lv.5，高度、窗戶、植栽、燈光隨等級變化）。

### XP 規則（`src/lib/xp.ts`）

| 行為 | XP |
|------|----|
| 觀看課程 1 分鐘 | +1 |
| 完成一組記憶卡 | +10 |
| 完成一題每日問題 | +5 |
| 完成一個章節 | +20 |
| 撰寫學習筆記 | +10 |
| 完成整門課程 | +100 |
| 中斷後重新回來 | +20 |

### 正向回歸

不做連續紀錄歸零、不扣分、不讓城市衰敗。久未登入回來時給予鼓勵與低門檻的小任務。

---

## 🤖 串接真正的 AI API

目前所有 AI 功能都是 `src/lib/ai.ts` 內的 **Mock**，回傳結構與正式 API 完全一致，因此上線時只需替換函式內部實作即可：

```ts
// 現在（Mock）：
export async function generateFlashcards(course: Course): Promise<Flashcard[]> {
  return delay(seedFlashcards.filter((f) => f.courseId === course.id));
}

// 之後（接後端 → Amazon Bedrock / Claude）：
export async function generateFlashcards(course: Course): Promise<Flashcard[]> {
  const res = await fetch("/api/ai/flashcards", {
    method: "POST",
    body: JSON.stringify({ transcript: course.transcript }),
  });
  return res.json();
}
```

可替換的函式：`generateFlashcards`、`generateQuiz`、`generateCatchupSummary`、`summarizeLearningNote`、`generateDailyTask`、`generateReturnNotification`、`recommendNextReview`。

> 建議把金鑰放在後端（Next.js Route Handler 或獨立服務），前端只呼叫自家 endpoint，不要在瀏覽器直接呼叫模型 API。

---

## ✅ 已完成功能

1. 城市首頁（含統計、今日任務、互動城市、繼續觀看、待複習、最近紀錄）
2. 8 棟可點擊建築 → 建築詳情頁
3. 今日任務（一次一個 + 更換任務）
4. 複習中心：記憶卡（翻面 / 三段熟悉度 / AI 重新解釋）
5. 問題測驗（作答 + 即時解析）
6. 課程列表（正在學 / 待複習 / 已完成 / AI 推薦下一步）
7. 學習紀錄時間軸（正向框架，不標記失敗日）
8. 可愛召回通知預覽（三種中斷程度 + 深連結）
9. XP 與建築升級（含升級慶祝動畫）
10. localStorage 儲存 + 重設 Demo 按鈕
11. 桌機 / 平板 / 手機響應式（手機城市改為橫向滑動）

## 🔜 尚未完成 / 下一階段建議

- **真實 AI 串接**：接 Amazon Bedrock（Claude）產生記憶卡、精華、召回文案。
- **間隔重複演算法**：目前記憶卡熟悉度僅記錄，未實作 SM-2/Leitner 排程。
- **真實影片播放與埋點**：目前為「模擬觀看」按鈕；正式版需接播放器並蒐集重播/暫停/離開等行為訊號。
- **後端與帳號系統**：登入驗證、跨裝置同步、雲端資料庫（localStorage → DynamoDB）。
- **召回通知的實際發送**：串接推播 / Email（正式版可用 EventBridge 排程 + SES/Pinpoint）。
- **建築 Lv.4–5 的精緻視覺**與更多裝飾、寵物養成延伸。
- **成效驗證儀表板**：任務參與者 vs 非參與者的留存 / 完課率對比。

---

## 🌱 設計理念一句話

> 我們不獎勵「連續」，我們獎勵「回來」——因為對成人學習者來說，能重新開始，比從不中斷更重要。
