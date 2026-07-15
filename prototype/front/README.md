# 課前學習人格測驗（深色／淺色合併版）— 部署說明

## 這是什麼

這是一個完整、獨立的網頁測驗，已經把「淺色版」與「深色版」合併成同一個檔案。
右上角有一顆固定的切換鈕，可以隨時切換深色／淺色模式，
而且會用瀏覽器記住使用者上次選的模式，下次打開自動套用。

整個網站只有一個 `index.html`，所有圖片（吉祥物、角色圖、封面等共 12 張）
都已用 base64 內嵌在檔案裡，不需要額外的圖片資料夾。
文字字型會在使用者開啟時自動從 Google Fonts 載入。

已內建響應式設計，手機、平板、電腦打開都能正常顯示與操作。

## 切換鈕怎麼運作

- 頁面右上角的圓形按鈕：淺色模式顯示太陽圖示，深色模式顯示月亮圖示，點一下即切換。
- 選擇會存在瀏覽器（localStorage），重新整理或下次造訪仍會維持上次的選擇。
- 若瀏覽器不支援或停用 localStorage，切換仍可正常運作，只是不會被記住，預設為淺色。

## 如何部署到網路上（讓大家都能開）

只要把整個資料夾（或裡面的 `index.html`）上傳到任何一個「靜態網站」服務即可，
以下任選一個，都免費、幾分鐘就能拿到網址：

### 方法 A：Cloudflare Pages（推薦，你已有 Cloudflare 帳號）
1. 登入 Cloudflare → 左側選單找到「Workers & Pages」→「Pages」
2. 選「Upload assets」（直接上傳，不需要 Git）
3. 把這個 `learning-personality-quiz` 資料夾拖進去上傳
4. 按 Deploy，完成後會給你一個 `xxx.pages.dev` 的公開網址

### 方法 B：Netlify（最快，拖曳即可）
1. 前往 https://app.netlify.com/drop
2. 直接把整個資料夾拖進頁面
3. 上傳完立刻產生公開網址

### 方法 C：GitHub Pages
1. 建立一個新的 GitHub repository
2. 把 `index.html` 上傳進去
3. Settings → Pages → Source 選 `main` 分支 → Save
4. 稍等一兩分鐘會給你 `你的帳號.github.io/repo名稱` 的網址

### 方法 D：Vercel
1. 前往 https://vercel.com → New Project
2. 上傳資料夾或連結 Git → Deploy

## 想改內容的話

直接用文字編輯器（VS Code 等）打開 `index.html`：
- 測驗題目與選項：搜尋 `const QS`
- 主題選項：搜尋 `const THEMES`
- 結果人格說明：搜尋 `const RESULT`
- 影片標題清單：搜尋 `const TITLES`
- 兩套配色：淺色在 `:root{ }` 裡，深色在 `html[data-theme="dark"]{ }` 裡，
  想調色改這兩處的顏色變數即可。

改完存檔後重新上傳即可更新網站。

## 小提醒

- 字型從 Google Fonts 載入，正常網路環境沒問題；若環境連不到 Google，
  字型會退回系統預設字體，版面仍可正常使用。
- 若想改預設一開啟是深色，把 `index.html` 最上方 `<html lang="zh-Hant-TW" data-theme="light">`
  的 `light` 改成 `dark` 即可（使用者若曾手動切換過，仍以他上次的選擇為準）。
