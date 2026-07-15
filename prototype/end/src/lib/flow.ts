/**
 * 三段式動線的共用工具：front（課前測驗）→ mid（影片學習）→ end（本 app，學習城市）。
 *
 * 主題三個 app 共用 localStorage key「ppa-theme」。end 是獨立 origin（:3000），
 * 跟 front/mid（:8899）不共享 localStorage，所以跨 app 一律用網址參數 ?theme= 帶著走。
 */
export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.setAttribute("data-theme", t);
  try {
    localStorage.setItem("ppa-theme", t);
  } catch {}
  try {
    const url = new URL(location.href);
    url.searchParams.set("theme", t);
    history.replaceState(null, "", url);
  } catch {}
}

/** front / mid 在 :8899；用目前主機名組出網址，localhost / 127.0.0.1 / 區網 IP 都通。 */
export function crossHost(port: number): string {
  const host = typeof location !== "undefined" ? location.hostname || "localhost" : "localhost";
  const proto = typeof location !== "undefined" ? location.protocol : "http:";
  return `${proto}//${host}:${port}`;
}

/** 「去上課」→ mid 播放器，帶上目前主題與來源。 */
export function midUrl(): string {
  return `${crossHost(8899)}/mid/?theme=${getTheme()}&from=city`;
}

/** 「重新做人格測驗」→ front。 */
export function frontUrl(): string {
  return `${crossHost(8899)}/front/?theme=${getTheme()}`;
}
