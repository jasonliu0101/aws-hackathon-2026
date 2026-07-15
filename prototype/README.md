# PPA 三段式學習動線 — front × mid × end

把一次完整的學習旅程拆成三段、串成一條線：

```
 front（課前）           mid（學習中）                    end（課後）
 ─────────────           ─────────────                    ─────────────
 學習人格測驗    ──▶     PPA 影片播放器 + AI 助教   ──▶   學習城市（遊戲化養成）
 測出你的節奏            重播熱力圖 / 投票 / Reels        每次學習長成一座城市
        ▲                        │  ▲                            │
        └────────────────────────┘  └────────────────────────────┘
              重新測驗                    去上課（回播放器）
```

- **front** — 課前學習人格測驗（單一 HTML，可獨立部署）。測完推薦影片，點了進 mid。
- **mid** — PPA 影片學習原型（重播熱力圖 × AI 助教 × 投票 × 精華 Reels × 創作者後台）。
- **end** — 學習城市（Next.js，遊戲化）。課程「去上課」進 mid；學完回來，城市長大。

---

## 一鍵啟動

```bash
bash prototype/start.sh
```

打開 **http://localhost:8899** —— 會導向課前測驗，動線就從這裡開始。

| | 網址 |
|---|---|
| 動線入口（→ 測驗） | http://localhost:8899 |
| front 課前測驗 | http://localhost:8899/front/ |
| mid 影片學習 | http://localhost:8899/mid/ |
| mid 創作者後台 | http://localhost:8899/mid/creator.html |
| end 學習城市 | http://localhost:3000/ |

> front + mid 同一個 origin（:8899，`serve.js` 提供，支援影片 Range）；
> end 是 Next.js，跑在 :3000。**end 必須是 3000**（跨 app 連結寫死這個埠）。

手動分開跑：

```bash
node prototype/serve.js                 # front + mid  :8899
cd prototype/end && PORT=3000 npm run dev   # end          :3000
```

---

## 深／淺色：三端聯動

三個 app 共用一個 localStorage key **`ppa-theme`**（值 `light` / `dark`）。
在任何一頁切主題，其他兩頁都會跟上：

- **front** 右上角圓鈕、**mid** 資訊列「☀ 淺色 / 🌙 深色」、**end** 右上角日月鈕，切的是同一個設定。
- **同 origin**（front ↔ mid）用 `storage` 事件即時聯動。
- **跨 origin**（→ end 在別的埠）靠連結攜帶 `?theme=` 帶過去 —— 你按「我的學習」跳到城市，城市就是你剛才選的顏色。
- 載入優先序：網址 `?theme=` ＞ localStorage ＞ 各自預設（front 淺、mid 深、end 淺）。

主題的視覺分工，刻意各自貼合場景：

| | 預設 | 加了什麼 |
|---|---|---|
| front | 淺 | 本來就有深／淺兩套（沒動它的視覺）|
| **mid** | 深 | **補了淺色**：導覽列 / 資訊區 / 目錄 / 筆記 / AI 助教側欄轉淺，**影片與它的疊層維持深色**（PPA 淺色模式本來就長這樣）|
| **end** | 淺 | **補了深色**：集中重映射它用到的 Tailwind utility + shadcn 變數，不逐一改元件 |

---

## 串接點（「邏輯」長怎樣）

| 從 | 觸發 | 到 | 帶了什麼 |
|---|---|---|---|
| front | 結果頁點推薦影片 | mid | `?theme` `?from=quiz` `?rec=<影片名>` `?topic` |
| mid | 導覽列「我的學習」 | end | `?theme` |
| end | 課程卡「繼續觀看 / 複習」 | mid | `?theme` `?from=city` |
| end | （flow.ts `frontUrl()`）| front | `?theme` |

mid 從測驗來會打聲招呼（toast 顯示 `rec`）；end 的「去上課」會先把觀看記進城市狀態（localStorage），
所以從 mid 回到城市時，城市已經長大了 —— 這就是它的正向回饋。

### 測試捷徑

- `front/?demo=result` —— 跳過測驗直接看結果頁（驗證「點影片 → mid」），純 JS、不動視覺。
- `front/?demo=result&theme=dark` —— 加主題。
- mid 的 `?open=` / `?selftest=1` 見 `mid/README.md`。

---

## 目錄

```
prototype/
  serve.js          front + mid 的統一靜態伺服器（Range）
  start.sh          一鍵啟動 serve.js + end 的 Next dev
  front/            課前人格測驗（單一 index.html）
  mid/              PPA 影片學習原型（詳見 mid/README.md）
  end/              學習城市 Next.js（詳見 end/README.md）
```
