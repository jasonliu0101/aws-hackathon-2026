"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, type Theme } from "@/lib/flow";

/**
 * 深／淺色切換。與 front、mid 共用「ppa-theme」，切了就聯動：
 * 同 origin 靠 storage 事件即時同步，跨 app 靠連結攜帶 ?theme=（見 flow.ts）。
 */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getTheme());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ppa-theme" && (e.newValue === "dark" || e.newValue === "light")) {
        document.documentElement.classList.toggle("dark", e.newValue === "dark");
        document.documentElement.setAttribute("data-theme", e.newValue);
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切換深色／淺色（三個頁面聯動）"
      title="切換深色／淺色（三個頁面聯動）"
      className="grid h-12 w-12 place-items-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
