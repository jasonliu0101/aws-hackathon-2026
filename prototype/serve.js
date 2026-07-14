#!/usr/bin/env node
/**
 * 支援 HTTP Range 的靜態伺服器。
 *
 * 為什麼不用 `python3 -m http.server`：它不支援 Range 請求。
 * 沒有 Range，<video> 就沒辦法 seek —— 瀏覽器只能整支 75MB 下載完才給你跳。
 * Reels 有 7 個 clip 各自 seek 到不同區間，沒有 Range 這功能等於廢掉。
 *
 *   node serve.js  →  http://localhost:8899
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8899;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4':  'video/mp4',
  '.jpg':  'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }

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
        'Content-Type':   type,
        'Content-Length': end - start + 1,
        'Content-Range':  `bytes ${start}-${end}/${st.size}`,
        'Accept-Ranges':  'bytes',
        'Cache-Control':  'public, max-age=3600',
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type':   type,
        'Content-Length': st.size,
        'Accept-Ranges':  'bytes',
        'Cache-Control':  rel.endsWith('.mp4') ? 'public, max-age=3600' : 'no-cache',
      });
      fs.createReadStream(file).pipe(res);
    }
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`▶  PPA 原型： http://localhost:${PORT}`);
  console.log(`   （支援 Range 請求，影片 seek / Reels 才會順）`);
});
