"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CalendarDays, House } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <div className="site-stage">
      <div className="site-shell">
        <header className="border-b border-slate-100 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-10">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200">
                <BookOpen className="h-6 w-6" />
              </span>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900">學習城市</div>
                <div className="text-[9px] font-bold tracking-[.2em] text-slate-400">LEARNING CITY</div>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
              <ThemeToggle />
              <Link href="/notifications" aria-label="通知" className="relative grid h-12 w-12 place-items-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" /></Link>
              <Link href="/calendar" aria-label="學習日曆" className="grid h-12 w-12 place-items-center rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100"><CalendarDays className="h-5 w-5" /></Link>
              {!isHome && <Link href="/" aria-label="回到城市總覽" title="回到城市總覽" className="grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"><House className="h-5 w-5" /></Link>}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
