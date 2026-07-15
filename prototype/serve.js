#!/usr/bin/env node
/**
 * prototype 統一靜態伺服器 —— 一個 origin 服務 front + mid。
 *
 *   node prototype/serve.js   →  http://localhost:8899
 *
 *   /            → 302 導向 /front/   （整條動線的起點：課前人格測驗）
 *   /front/      → 課前人格測驗
 *   /mid/        → PPA 影片學習（播放器 / AI 助教 / 投票 / Reels）
 *   /mid/creator.html → 創作者後台
 *
 * end（學習城市）是 Next.js，另外跑在 :3000 —— 見 prototype/start.sh。
 *
 * 為什麼自己寫而不用 `python3 -m http.server`：後者不支援 HTTP Range，
 * <video> 就沒辦法 seek，mid 的 Reels 會整支 75MB 下載完才能播。
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;                 // prototype/
const PORT = process.env.PORT || 8899;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4':  'video/mp4',
  '.jpg':  'image/jpeg', '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2', '.woff': 'font/woff',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);

  // 動線起點：根路徑導向課前測驗
  if (rel === '/' || rel === '') {
    res.writeHead(302, { Location: '/front/' });
    res.end();
    return;
  }

  let file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }

  fs.stat(file, (err, st) => {
    // 目錄 → 補上 index.html
    if (!err && st.isDirectory()) {
      if (!rel.endsWith('/')) { res.writeHead(302, { Location: rel + '/' }); res.end(); return; }
      file = path.join(file, 'index.html');
      try { st = fs.statSync(file); } catch { res.writeHead(404).end('not found'); return; }
    } else if (err || !st.isFile()) {
      res.writeHead(404).end('not found');
      return;
    }

    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end   = m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (start >= st.size || end >= st.size || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }).end();
        return;
      }
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${st.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': st.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': file.endsWith('.mp4') ? 'public, max-age=3600' : 'no-cache',
      });
      fs.createReadStream(file).pipe(res);
    }
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`▶  PPA 動線： http://localhost:${PORT}`);
  console.log(`   /front/  課前測驗   →   /mid/  影片學習   →   :3000  學習城市（另跑 Next.js）`);
});
