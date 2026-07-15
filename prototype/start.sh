#!/usr/bin/env bash
# 一鍵啟動三段式動線：front（課前測驗）→ mid（影片學習）→ end（學習城市）
#
#   front + mid  由 serve.js 服務於 :8899（同一個 origin，支援影片 Range）
#   end          Next.js 開發伺服器於 :3000
#
# 用法：  bash prototype/start.sh
# 停止：  Ctrl-C（會一起收掉兩個 server）
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"

# end 必須跑在 3000（跨 app 連結寫死這個埠）。先清掉佔用者。
if lsof -ti tcp:3000 >/dev/null 2>&1; then
  echo "· 清掉佔用 :3000 的舊程序"
  lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true
fi
pkill -f "prototype/serve.js" 2>/dev/null || true

echo "· 啟動 front + mid  → http://localhost:8899"
node "$HERE/serve.js" &
SERVE_PID=$!

echo "· 啟動 end（學習城市）→ http://localhost:3000（首次編譯約 10-15 秒）"
( cd "$HERE/end" && [ -d node_modules ] || npm install )
( cd "$HERE/end" && PORT=3000 npm run dev ) &
END_PID=$!

trap 'echo; echo "· 收工"; kill $SERVE_PID $END_PID 2>/dev/null || true' INT TERM

cat <<EOF

────────────────────────────────────────────────────────
  動線入口： http://localhost:8899   （會導向課前測驗）

  front 課前測驗   http://localhost:8899/front/
  mid   影片學習   http://localhost:8899/mid/
  mid   創作者後台 http://localhost:8899/mid/creator.html
  end   學習城市   http://localhost:3000/

  三端主題聯動：任一頁右上（或資訊列）切深／淺色，會帶著走。
  Ctrl-C 結束。
────────────────────────────────────────────────────────
EOF

wait
