/* ═══════════════════════════════════════════════════════════════════════
   PPA 播放介面原型
   ─────────────────────────────────────────────────────────────────────
   一句話：把「全班在哪裡按暫停」當成訊號，讓 AI 助教知道該在哪一秒出現。

   四個功能，一條動線：
     1  暫停熱力圖 — 486 人的暫停行為疊在進度條上，峰值 = 卡關點
     2  AI 助教    — 播到峰值就出現，講的不是摘要，是「你為什麼卡在這」
     3  整理筆記    — 從逐字稿長出重點 / 名詞 / 數字 / 你個人的卡關點 / 一題挑戰
     4  精華 Reels  — AI 把卡關點剪成 20–30 秒直式短片，滑著看
     5  主動推播    — 依卡關點 + 內容語意排回訪（影片說「睡前最重要」→ 就排睡前）
   ═══════════════════════════════════════════════════════════════════════ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const fmt = s => {
  s = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

let D;                       // course.json
const state = {
  fired:     new Set(),      // 已經跳出過助教卡的介入點
  myPauses:  [],             // 這次 session 使用者自己的暫停
  quizDone:  false,
  reelIdx:   0,
  liked:     new Set(),
};

/* ═════════════════════════════ Toast ═════════════════════════════ */
function toast(html, { em = '✦', ai = false, ms = 3400 } = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (ai ? ' ai' : '');
  el.innerHTML = `<span class="em">${em}</span><span>${html}</span>`;
  $('#toasts').append(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, ms);
}

/* ═════════════════════════════ 啟動 ═════════════════════════════ */
(async function init() {
  D = await (await fetch('data/course.json')).json();

  const v = $('#video');
  $('#mTitle').textContent  = `${D.course.unit} ${D.course.title}`;
  $('#mSeries').textContent = D.course.series;
  $('#mPlan').textContent   = D.course.plan;
  $('#mDate').textContent   = D.course.publishedAt;
  $('#mViews').textContent  = D.course.views.toLocaleString();
  $('#tDur').textContent    = fmt(D.course.duration);
  $('#lgN').textContent     = D.cohort.n;
  $('#stuckN').textContent  = D.hotspots.length;
  $('#reelsN').textContent  = D.clips.length;
  $('#aiNote').innerHTML    = `你上次看到 <b>${fmt(D.me.lastPosition)}</b>，還剩 ${Math.round(D.course.duration - D.me.lastPosition)} 秒`;

  buildHeat();
  buildMarks();
  buildToc();
  buildStuck();
  wirePlayer(v);
  wireSide();
  wireCoach(v);
  wireNotes(v);
  wireReels(v);
  wirePush(v);

  toast(`已載入 <b>${D.cohort.n}</b> 位學員的暫停資料 · 找到 <b>${D.hotspots.length}</b> 個卡關點`, { ai: true, ms: 4200 });

  demoJump(v);
})();

/* Demo 捷徑 —— 上台時不用臨場點一輪，直接開對應畫面：
     ?open=coach   播到最高峰的卡關點，助教卡攤開
     ?open=notes   AI 筆記
     ?open=reels   精華 Reels（?i=2 指定第幾則）
     ?open=sched   推播排程
     ?open=push    推播卡
     ?t=297        跳到第幾秒                                            */
function demoJump(v) {
  const q = new URLSearchParams(location.search);
  if (q.has('t')) v.currentTime = +q.get('t');

  switch (q.get('open')) {
    case 'coach': {
      const h = D.hotspots.find(x => x.id === (q.get('h') || 'h5'));
      v.currentTime = h.t;
      state.fired.add(h.id);
      openCoach(h, true);
      break;
    }
    case 'notes': $('#notesBtn').click(); break;
    case 'reels': openReels(+(q.get('i') || 0)); break;
    case 'sched': openSched(); break;
    case 'push':  showPush(D.push[0]); break;
    case 'stuck': $$('.stab').find(t => t.dataset.tab === 'stuck').click(); break;
  }

  if (q.has('probe')) setTimeout(probe, 900);
}

/* 版面探針：用量的，不用眼睛猜。結果寫進 title，headless --dump-dom 讀得到。 */
function probe() {
  const R  = s => { const e = $(s); return e ? e.getBoundingClientRect() : null; };
  const px = n => Math.round(n);
  const track = R('#track'), heat = R('#heat'), sub = R('.subtitle'), ctl = R('.controls');
  const bars  = $$('#heat i');
  const first = bars[0].getBoundingClientRect(), last = bars.at(-1).getBoundingClientRect();

  const out = [
    `track=[${px(track.left)},${px(track.right)}]`,
    `heat=[${px(heat.left)},${px(heat.right)}]`,
    `bars=[${px(first.left)},${px(last.right)}]`,
    `align=${Math.abs(first.left - track.left) < 2 && Math.abs(last.right - track.right) < 2 ? 'OK' : 'OFF'}`,
    `bars#=${bars.length}`,
    `marks#=${$$('.mark').length}`,
    // 字幕不能被控制列吃掉
    `sub=${sub ? `[${px(sub.top)},${px(sub.bottom)}]` : 'none'}`,
    `ctlTop=${px(ctl.top)}`,
    `subClear=${!sub || sub.bottom <= ctl.top + 2 ? 'OK' : 'OVERLAP'}`,
    `fill=${$('#trackFill').style.width}`,
    `t=${$('#video').currentTime.toFixed(1)}`,
  ].join(' · ');

  document.title = 'PROBE ' + out;
}

// headless 驗證用：出錯就寫進 title，--dump-dom 抓得到
window.onerror = m => { document.title = 'JS-ERROR: ' + m; };

/* ═════════════════════════════ 1 · 暫停熱力圖 ═════════════════════════════
   進度條上方那排柱子。每根 = 5 秒，高度 = 那 5 秒內按下暫停的人數。
   顏色分五級 —— 到了紅色，就是全班有將近一半的人在那裡停下來。            */

const HEAT_MAX = () => Math.max(...D.heatmap.map(b => b.pauses));

function heatColor(rate) {
  if (rate < 0.08) return '#3a4356';
  if (rate < 0.16) return '#5a6a86';
  if (rate < 0.28) return '#c78a3a';
  if (rate < 0.45) return '#ff8c3a';
  return '#ff4d4d';
}

function buildHeat() {
  const max = HEAT_MAX();
  $('#heat').innerHTML = D.heatmap.map((b, i) => {
    const h = Math.max(2, (b.pauses / max) * 30);
    return `<i data-b="${i}" class="${b.sponsor ? 'skip' : ''}"
               style="--hh:${h.toFixed(1)}px;--hb:${heatColor(b.rate)}"></i>`;
  }).join('');
}

/** 使用者按下暫停 → 這一格立刻 +1，柱子長高、閃一下。
    這是整個原型的核心主張：訊號是「用」出來的，不是「猜」出來的。 */
function recordPause(t) {
  const i = Math.floor(t / D.cohort.bucketSec);
  const b = D.heatmap[i];
  if (!b) return;

  b.pauses += 1;
  b.rate = b.pauses / D.cohort.n;
  state.myPauses.push(t);

  const bar = $(`#heat i[data-b="${i}"]`);
  if (bar) {
    const max = HEAT_MAX();
    bar.style.setProperty('--hh', `${Math.max(2, (b.pauses / max) * 30).toFixed(1)}px`);
    bar.style.setProperty('--hb', heatColor(b.rate));
    bar.classList.remove('bump');
    void bar.offsetWidth;                 // 重跑動畫
    bar.classList.add('bump');
  }

  const hot = D.hotspots.find(h => Math.abs(h.t - t) < 8);
  if (hot) {
    toast(`你是第 <b>${b.pauses}</b> 位在 ${fmt(t)} 暫停的人 — AI 助教認得這個點`, { em: '⏸', ai: true });
  } else {
    toast(`已記錄暫停 <b>${fmt(t)}</b> · 這一格累積 ${b.pauses} 人`, { em: '⏸', ms: 2400 });
  }
}

/* 介入點標記（進度條上那些會脈動的紫點） */
function buildMarks() {
  $('#marks').innerHTML = D.hotspots.map(h => `
    <button class="mark" data-h="${h.id}" style="left:${(h.t / D.course.duration) * 100}%"
            title="${fmt(h.t)}｜${h.pauses} 人暫停（${Math.round(h.rate * 100)}%）">💡</button>
  `).join('');

  $$('#marks .mark').forEach(m => m.onclick = e => {
    e.stopPropagation();
    const h = D.hotspots.find(x => x.id === m.dataset.h);
    $('#video').currentTime = h.t - 3;
    openCoach(h, true);
  });
}

/* ═════════════════════════════ 目錄 / 卡關點側欄 ═════════════════════════════ */
function buildToc() {
  $('#toc').innerHTML = D.chapters.map((c, i) => {
    const next = D.chapters[i + 1]?.t ?? D.course.duration;
    const n = D.hotspots.filter(h => h.t >= c.t && h.t < next).length;
    return `<li data-i="${i}"><button data-t="${c.t}">
      <span class="ts">${fmt(c.t)}</span>
      <span class="bul"></span>
      <span class="tx">${c.title}${n ? `<i class="hotn">💡 ${n}</i>` : ''}</span>
    </button></li>`;
  }).join('');

  $$('#toc button').forEach(b => b.onclick = () => {
    $('#video').currentTime = +b.dataset.t;
    $('#video').play();
  });
}

function buildStuck() {
  const max = Math.max(...D.hotspots.map(h => h.rate));
  $('#stuck').innerHTML = D.hotspots.map(h => `
    <li><button data-h="${h.id}">
      <div class="stuck-top">
        <span class="ts">${fmt(h.t)}</span>
        <span class="kind">${kindLabel(h.kind)}</span>
        <span class="pc">${Math.round(h.rate * 100)}%</span>
      </div>
      <div class="stuck-lbl">${h.label}</div>
      <div class="stuck-bar"><i style="--w:${(h.rate / max) * 100}%"></i></div>
    </button></li>
  `).join('');

  $$('#stuck button').forEach(b => b.onclick = () => {
    const h = D.hotspots.find(x => x.id === b.dataset.h);
    $('#video').currentTime = h.t - 3;
    $('#video').play();
    openCoach(h, true);
    $('#player').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

const kindLabel = k => ({
  numbers:   '數字記不住',
  jargon:    '名詞沒定義',
  citation:  '來源想確認',
  procedure: '步驟要照做',
}[k] ?? k);

function wireSide() {
  $$('.stab').forEach(t => t.onclick = () => {
    $$('.stab').forEach(x => x.classList.toggle('is-on', x === t));
    $('#paneToc').hidden   = t.dataset.tab !== 'toc';
    $('#paneStuck').hidden = t.dataset.tab !== 'stuck';
  });

  $('#resumeCard').onclick = () => {
    $('#video').currentTime = D.me.lastPosition;
    $('#video').play();
    toast(`從 <b>${fmt(D.me.lastPosition)}</b> 接著看`, { em: '▶' });
  };

  $('#aiTab').onclick = () => {
    $$('.stab').find(t => t.dataset.tab === 'stuck').click();
    $('.side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

/* ═════════════════════════════ 播放器 ═════════════════════════════ */
function wirePlayer(v) {
  const player = $('#player');
  const track  = $('#track');

  const cueAt = t => D.cues.find(c => t >= c.start && t < c.end);
  const chapAt = t => [...D.chapters].reverse().find(c => c.t <= t) ?? D.chapters[0];

  let ccOn = true;
  let seeking = false;

  const toggle = () => v.paused ? v.play() : v.pause();
  $('#playBtn').onclick = toggle;
  $('#bigPlay').onclick = toggle;
  v.onclick = toggle;

  v.onplay  = () => { player.classList.add('playing');  swapPlayIcon(true);  };
  v.onpause = () => {
    player.classList.remove('playing');
    swapPlayIcon(false);
    if (!seeking && v.currentTime > 1) {
      recordPause(v.currentTime);
      maybeCoachOnPause(v.currentTime);
    }
  };

  function swapPlayIcon(playing) {
    $('#playBtn .i-play').hidden  = playing;
    $('#playBtn .i-pause').hidden = !playing;
  }

  v.ontimeupdate = () => {
    const t = v.currentTime, d = D.course.duration;
    $('#trackFill').style.width = `${(t / d) * 100}%`;
    $('#trackKnob').style.left  = `${(t / d) * 100}%`;
    $('#tCur').textContent = fmt(t);

    const c = ccOn ? cueAt(t) : null;
    $('#subtitle').textContent = c ? c.text : '';

    const ch = chapAt(t);
    $('#ctlChapter').textContent = ch.title;
    const i = D.chapters.indexOf(ch);
    $$('#toc li').forEach(li => li.classList.toggle('on', +li.dataset.i === i));

    checkHotspot(t);
  };

  /* 進度條：點擊 seek + hover 預覽（顯示那一秒有多少人暫停） */
  const posOf = e => clamp((e.clientX - track.getBoundingClientRect().left) / track.offsetWidth, 0, 1);

  track.onclick = e => { seeking = true; v.currentTime = posOf(e) * D.course.duration; seeking = false; };

  track.onmousemove = e => {
    const t = posOf(e) * D.course.duration;
    const b = D.heatmap[Math.floor(t / D.cohort.bucketSec)];
    const h = D.hotspots.find(x => Math.abs(x.t - t) < 7);
    const tip = $('#scrubTip');
    tip.hidden = false;
    tip.style.left = `${(t / D.course.duration) * 100}%`;
    tip.innerHTML = `${fmt(t)} · <b>${b?.pauses ?? 0}</b> 人在這暫停`
      + (h ? `<span class="st-hot">💡 AI 助教介入點 — ${kindLabel(h.kind)}</span>` : '');
  };
  track.onmouseleave = () => $('#scrubTip').hidden = true;

  /* 滑鼠在播放器上才顯示控制列 */
  let hideT;
  player.onmousemove = () => {
    player.classList.add('hot');
    clearTimeout(hideT);
    hideT = setTimeout(() => !v.paused && player.classList.remove('hot'), 2600);
  };
  player.onmouseleave = () => !v.paused && player.classList.remove('hot');

  $('#muteBtn').onclick = () => {
    v.muted = !v.muted;
    $('#muteBtn').style.opacity = v.muted ? .4 : .92;
  };
  $('#ccBtn').onclick = () => {
    ccOn = !ccOn;
    $('#ccBtn').classList.toggle('off', !ccOn);
    if (!ccOn) $('#subtitle').textContent = '';
  };
  $('#fsBtn').onclick = () => {
    document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen();
  };
  $('#clapBtn').onclick = e => {
    e.currentTarget.classList.add('clapped');
    $('#clapN').textContent = '100+';
  };

  /* 快捷鍵 */
  document.onkeydown = e => {
    if (e.target.tagName === 'INPUT' || !$('#reels').hidden) return;
    if (e.code === 'Space')      { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') v.currentTime += 5;
    if (e.code === 'ArrowLeft')  v.currentTime -= 5;
  };
}

/* ═════════════════════════════ 2 · AI 助教介入 ═════════════════════════════
   兩種觸發，兩種語氣：
     被動 — 播到峰值：先小聲提醒（只給「why」），不打斷你。
     主動 — 你自己在峰值附近按了暫停：那你是真的卡住了，直接把解說攤開。      */

let coachHot = null;

function checkHotspot(t) {
  for (const h of D.hotspots) {
    if (Math.abs(t - h.t) < 0.5 && !state.fired.has(h.id)) {
      state.fired.add(h.id);
      openCoach(h, false);
    }
    // seek 回去 → 允許再觸發一次
    if (t < h.t - 12) state.fired.delete(h.id);
  }
}

function maybeCoachOnPause(t) {
  const h = D.hotspots.find(x => Math.abs(x.t - t) < 8);
  if (h) setTimeout(() => openCoach(h, true), 420);
}

function openCoach(h, expand) {
  coachHot = h;
  const c = $('#coach');

  $('#coachKind').textContent  = kindLabel(h.kind);
  $('#coachPct').textContent   = `${Math.round(h.rate * 100)}%`;
  $('#coachRing').style.setProperty('--p', `${Math.round(h.rate * 100)}%`);
  $('#coachCount').textContent = `${h.pauses} 位同學`;
  $('#coachWhy').textContent   = h.why;

  const md = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  $('#coachAnswer').innerHTML  = h.answer.map(a => `<p>${md(a)}</p>`).join('');
  $('#coachSticky').textContent = h.sticky;

  $('#coachAnswer').hidden = !expand;
  $('#coachSticky').hidden = !expand;
  $('#coachExplain').textContent = expand ? '收合解說' : '為我解釋這段';

  c.hidden = false;
  $$('#marks .mark').forEach(m => m.classList.toggle('done', m.dataset.h === h.id));

  clearTimeout(openCoach.t);
  if (!expand) {
    // 沒展開的話，過幾秒自己收掉 —— 不要變成另一個煩人的彈窗
    openCoach.t = setTimeout(() => { if ($('#coachAnswer').hidden) closeCoach(); }, 7000);
  }
}

function closeCoach() { $('#coach').hidden = true; }

function wireCoach(v) {
  $('#coachX').onclick = closeCoach;

  $('#coachExplain').onclick = () => {
    const open = $('#coachAnswer').hidden;
    $('#coachAnswer').hidden = !open;
    $('#coachSticky').hidden = !open;
    $('#coachExplain').textContent = open ? '收合解說' : '為我解釋這段';
    clearTimeout(openCoach.t);
    if (open) {
      v.pause();
      toast(`AI 助教用 <b>${coachHot.chapter}</b> 這段逐字稿回答你`, { ai: true, ms: 2800 });
    }
  };

  $('#coachClip').onclick = () => {
    const i = D.clips.findIndex(c => c.hotspot === coachHot.id);
    closeCoach();
    openReels(i < 0 ? 0 : i);
  };
}

/* ═════════════════════════════ 3 · AI 助教整理筆記 ═════════════════════════════ */
function wireNotes(v) {
  $('#notesBtn').onclick = () => {
    const n = $('#notes');
    if (!n.hidden) { n.hidden = true; return; }
    n.hidden = false;
    n.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    generateNotes(v);
  };
  $('#notesX').onclick = () => $('#notes').hidden = true;
}

/** 假的串流生成 —— 但每一步都對應真的做了什麼事，不是純裝飾。 */
async function generateNotes(v) {
  const body = $('#notesBody');
  const head = $('#notesH');
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const steps = [
    `讀取逐字稿 ${D.cues.length} 條字幕（9 分 25 秒）`,
    `比對全班 ${D.cohort.n} 人的暫停熱力圖`,
    `找出 ${D.hotspots.length} 個卡關點，其中 ${state.myPauses.length ? state.myPauses.length : D.me.myPauses.length} 個你自己也停了`,
    `萃取 ${D.notes.keyPoints.length} 個重點、${D.notes.glossary.length} 張名詞卡、${D.notes.numbers.length} 個關鍵數字`,
    `生成 ${D.quiz.length} 題知識挑戰`,
  ];

  head.textContent = '正在讀你的 9 分 25 秒逐字稿…';
  body.innerHTML = `<div class="gen">${steps.map(s => `<div class="gen-step"><span class="tick">○</span>${s}</div>`).join('')}
    <div class="gen-line" style="width:88%"></div>
    <div class="gen-line" style="width:64%"></div></div>`;

  const rows = $$('.gen-step', body);
  for (const [i, row] of rows.entries()) {
    row.classList.add('run');
    await wait(320 + i * 90);
    $('.tick', row).textContent = '✓';
    row.classList.remove('run');
  }
  await wait(260);

  head.textContent = '這一堂，AI 幫你留下這些';
  renderNotes(body, v);
  toast(`筆記整理完成 · 含 <b>${D.hotspots.length}</b> 個全班卡關點`, { ai: true });
}

function renderNotes(body, v) {
  const myPauses = state.myPauses.length ? state.myPauses : D.me.myPauses;

  // 「你卡住的地方」= 我的暫停 ∩ 全班熱點
  const mine = D.hotspots
    .map(h => ({ h, n: myPauses.filter(p => Math.abs(p - h.t) < 10).length }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n);

  const jump = t => `data-jump="${t}"`;

  body.innerHTML = `
    <div class="nsec">
      <div class="nsec-h">一句話總結</div>
      <div class="n-summary">${D.notes.summary}</div>
    </div>

    ${mine.length ? `
    <div class="nsec">
      <div class="nsec-h">你卡住的地方 · ${mine.length} 處</div>
      <div class="n-stuck">
        ${mine.map(({ h, n }) => `
          <div class="n-stuck-row">
            <span class="ts">${fmt(h.t)}</span>
            <span class="tx">${h.label}
              <em>你在這裡停了 ${n} 次 · 全班有 ${h.pauses} 人（${Math.round(h.rate * 100)}%）也停在這</em>
            </span>
            <button class="btn btn-ai" ${jump(h.t)}>重看 ↺</button>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="nsec">
      <div class="nsec-h">重點 · ${D.notes.keyPoints.length} 條（點時間戳跳回影片）</div>
      <div class="n-points">
        ${D.notes.keyPoints.map(p => `
          <button class="n-point" ${jump(p.t)}>
            <span class="ts">${fmt(p.t)}</span>
            <span class="tx">${p.point}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="nsec">
      <div class="nsec-h">關鍵數字</div>
      <div class="n-nums">
        ${D.notes.numbers.map(n => `
          <button class="n-num" ${jump(n.t)}>
            <b>${n.v}</b><span>${n.k}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="nsec">
      <div class="nsec-h">名詞卡 · ${D.notes.glossary.length} 張</div>
      <div class="n-grid">
        ${D.notes.glossary.map(g => `
          <button class="n-term" ${jump(g.t)}>
            <b>${g.term}</b><span>${g.def}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="nsec">
      <div class="nsec-h">知識挑戰 · 答對就完成今天的打卡</div>
      <div class="quiz" id="quiz"></div>
    </div>
  `;

  $$('[data-jump]', body).forEach(el => el.onclick = e => {
    e.stopPropagation();
    v.currentTime = +el.dataset.jump - 2;
    v.play();
    $('#player').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  renderQuiz($('#quiz'), v);
}

function renderQuiz(box, v) {
  const q = D.quiz[0];
  box.innerHTML = `
    <div class="quiz-q"><span class="ts">${fmt(q.t)}</span>${q.q}</div>
    <div class="quiz-opts">
      ${q.options.map((o, i) => `
        <button class="qopt" data-i="${i}">
          <span class="k">${'ABC'[i]}</span><span>${o}</span>
        </button>`).join('')}
    </div>`;

  $$('.qopt', box).forEach(btn => btn.onclick = () => {
    const i = +btn.dataset.i;
    const right = i === q.answer;

    $$('.qopt', box).forEach(b => {
      b.disabled = true;
      if (+b.dataset.i === q.answer) b.classList.add('right');
    });
    if (!right) btn.classList.add('wrong');

    const ex = document.createElement('div');
    ex.className = 'quiz-ex';
    ex.innerHTML = `<b>${right ? '答對了。' : '再想一下。'}</b> ${q.explain}`;
    box.append(ex);

    const done = document.createElement('div');
    done.className = 'quiz-done';
    done.innerHTML = `
      <span class="flame">🔥</span>
      <div>連續打卡 <b>第 4 天</b> — 這是留存最強的預測因子（r=+0.356）。<br>
      AI 助教已依你的卡關點排好 <b>3 次回訪推播</b>，點右上角 🔔 看排程。</div>`;
    box.append(done);

    state.quizDone = true;
    $('#bellDot').hidden = false;
    toast('AI 已排好 3 次回訪推播 · 點右上角 🔔', { em: '🔔', ai: true, ms: 5200 });
  });
}

/* ═════════════════════════════ 4 · 精華 Reels ═════════════════════════════
   AI 從卡關點剪出 20–30 秒的直式短片。同一支影片、不同區間、循環播放。
   碎片時間滑一輪，等於把整堂課最難的地方複習一次。                        */

function wireReels(v) {
  $('#reelsBtn').onclick = () => openReels(0);
  $('#reelsX').onclick   = closeReels;

  document.addEventListener('keydown', e => {
    if ($('#reels').hidden) return;
    if (e.code === 'Escape')    closeReels();
    if (e.code === 'ArrowDown') { e.preventDefault(); goReel(state.reelIdx + 1); }
    if (e.code === 'ArrowUp')   { e.preventDefault(); goReel(state.reelIdx - 1); }
  });
}

function openReels(idx = 0) {
  $('#video').pause();
  const feed = $('#reelsFeed');

  feed.innerHTML = D.clips.map((c, i) => `
    <section class="reel" data-i="${i}">
      <div class="reel-card" style="--bgimg:url('assets/thumbs/${c.id}.jpg')">
        <div class="reel-prog"><i></i></div>

        <div class="reel-tag">
          <span class="rtag ai">✦ AI 剪輯</span>
          ${c.pauses ? `<span class="rtag hot">🔥 ${c.pauses} 人卡在這</span>` : ''}
          <span class="rtag">${Math.round(c.dur)} 秒</span>
          <span class="rtag">${c.chapter}</span>
        </div>

        <div class="reel-why">
          ${c.pauses
            ? `💡 <b>${c.pauses}</b> 人在這段按過暫停${c.id === 'c5' ? ' — 全課最高' : ''}`
            : '💡 課程收尾的核心觀點'}
        </div>

        <div class="reel-media">
          <video muted playsinline preload="none" poster="assets/thumbs/${c.id}.jpg"></video>
        </div>

        <div class="reel-cap"></div>

        <div class="reel-foot">
          <span class="reel-hook">${c.hook}</span>
          <div class="reel-title">${c.title}</div>
          <div class="reel-take">${c.takeaway}</div>
          <button class="reel-cta" data-t="${c.start}">
            <span>回到完整課程 ${fmt(c.start)}</span>
            <b>看完整段 →</b>
          </button>
        </div>

        <div class="reel-rail">
          <button class="rrail like" data-i="${i}">
            <span class="ic">♥</span><b>${1200 + i * 137}</b>
          </button>
          <button class="rrail save" data-i="${i}">
            <span class="ic">★</span><b>存</b>
          </button>
          <button class="rrail ask" data-i="${i}">
            <span class="ic">✎</span><b>出題</b>
          </button>
        </div>
      </div>
    </section>`).join('');

  $('#reels').hidden = false;
  document.body.style.overflow = 'hidden';

  // 互動
  $$('.reel-cta', feed).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const t = +b.dataset.t;
    closeReels();
    $('#video').currentTime = t;
    $('#video').play();
    $('#player').scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`從精華跳回完整課程 <b>${fmt(t)}</b>`, { em: '▶' });
  });

  $$('.rrail.like', feed).forEach(b => b.onclick = e => {
    e.stopPropagation();
    b.classList.toggle('on');
    state.liked.add(+b.dataset.i);
  });
  $$('.rrail.save', feed).forEach(b => b.onclick = e => {
    e.stopPropagation();
    b.classList.add('on');
    toast('已存到「我的精華」· 明天推播會再提醒你', { em: '🔖', ai: true });
  });
  $$('.rrail.ask', feed).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const c = D.clips[+b.dataset.i];
    toast(`AI 依「${c.hook}」出了 1 題 · 收進今天的知識挑戰`, { em: '✎', ai: true, ms: 4000 });
  });
  $$('.reel-media', feed).forEach(m => m.onclick = () => {
    const vid = $('video', m);
    vid.paused ? vid.play() : vid.pause();
  });

  // 滾動 → 換片
  let tick;
  feed.onscroll = () => {
    clearTimeout(tick);
    tick = setTimeout(() => {
      const i = Math.round(feed.scrollTop / window.innerHeight);
      if (i !== state.reelIdx) activateReel(i);
    }, 80);
  };

  goReel(idx, false);
}

function goReel(i, smooth = true) {
  i = clamp(i, 0, D.clips.length - 1);
  $('#reelsFeed').scrollTo({ top: i * window.innerHeight, behavior: smooth ? 'smooth' : 'auto' });
  activateReel(i);
}

/** 只讓 active ±1 的 video 掛 src —— 7 支 1080p 同時載會把記憶體吃爛。 */
function activateReel(i) {
  state.reelIdx = i;
  $('#reelsIdx').textContent = `${i + 1} / ${D.clips.length}`;

  $$('.reel').forEach(sec => {
    const j   = +sec.dataset.i;
    const vid = $('video', sec);
    const c   = D.clips[j];

    if (Math.abs(j - i) <= 1) {
      if (!vid.src) {
        vid.src = D.course.src;
        vid.currentTime = c.start;
      }
    } else {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      return;
    }

    if (j === i) {
      // 影片還沒解碼出來之前，字幕先擺第一句 —— 不要開場就是一片空白
      $('.reel-cap', sec).textContent = c.lines[0]?.text ?? '';

      const start = () => {
        vid.currentTime = c.start;
        vid.play().catch(() => {});
      };
      vid.readyState >= 1 ? start() : vid.addEventListener('loadedmetadata', start, { once: true });

      // 循環播放這一段 + 大字幕 + 進度
      vid.ontimeupdate = () => {
        const t = vid.currentTime;
        if (t >= c.end || t < c.start - 0.5) { vid.currentTime = c.start; return; }

        $('i', $('.reel-prog', sec)).style.width = `${((t - c.start) / (c.end - c.start)) * 100}%`;
        const cue = c.lines.find(l => t >= l.start && t < l.end);
        $('.reel-cap', sec).textContent = cue ? cue.text : '';
      };
    } else {
      vid.pause();
      vid.ontimeupdate = null;
    }
  });
}

function closeReels() {
  $$('#reelsFeed video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
  $('#reels').hidden = true;
  $('#reelsFeed').innerHTML = '';
  document.body.style.overflow = '';
}

/* ═════════════════════════════ 5 · 主動推播 ═════════════════════════════
   排程不是「隔 N 天推一次」的罐頭。它有兩個輸入：
     · 你卡在哪（暫停熱力圖）
     · 內容自己說了什麼（影片講「睡前那次最重要」→ 推播就排在睡前）
   推播的內容是一支 30 秒的 reel，不是一句「回來上課吧」。                  */

function wirePush(v) {
  $('#bellBtn').onclick = openSched;
  $('#schedX').onclick  = () => $('#sched').hidden = true;
  $('#pushLater').onclick = () => {
    $('#push').hidden = true;
    toast('好 — 那我明天同一時間再提醒你一次', { em: '🔔', ms: 3000 });
  };

  $('#schedDemo').onclick = () => {
    $('#sched').hidden = true;
    setTimeout(() => showPush(D.push[0]), 340);
  };
}

function openSched() {
  $('#bellDot').hidden = true;
  $('#schedList').innerHTML = D.push.map(p => {
    const clip = D.clips.find(c => c.id === p.clip);
    return `
      <li class="sched-item">
        <div class="sched-when">
          <b>${p.when}</b>
          <i class="${p.kind}">${{ rescue: '救援', spaced: '間隔重複', completion: '完課' }[p.kind]}</i>
        </div>
        <div class="sched-main">
          <strong>${p.title}</strong>
          <p>${p.body}</p>
          <div class="sched-tag">
            <b>觸發：</b>${p.trigger}<br>
            <b>時機：</b>${p.whenNote}<br>
            <b>內容：</b>${Math.round(clip.dur)} 秒精華「${clip.hook}」
          </div>
        </div>
      </li>`;
  }).join('');
  $('#sched').hidden = false;
}

let pushing = null;

function showPush(p) {
  pushing = p;
  const clip = D.clips.find(c => c.id === p.clip);

  $('#pushWhen').textContent  = p.when;
  $('#pushTitle').textContent = p.title;
  $('#pushBody').textContent  = p.body;
  $('#pushWhy').textContent   = `${p.trigger}。${p.whenNote}。`;
  $('#pushOpen').textContent  = `看 ${Math.round(clip.dur)} 秒精華 →`;
  $('#push').hidden = false;

  $('#pushOpen').onclick = () => {
    $('#push').hidden = true;
    openReels(D.clips.findIndex(c => c.id === p.clip));
    toast('從推播直接進精華 — 這就是回訪的入口', { em: '📲', ai: true, ms: 4000 });
  };
}
