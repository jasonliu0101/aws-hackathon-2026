"use client";

import Link from "next/link";
import { Bell, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { asset } from "@/lib/asset";
import { homeUrl, midUrl } from "@/lib/flow";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-stage">
      <div className="site-shell">
        {/* 平台 navbar —— 與 mid 一致的上層導覽，可回首頁繼續觀課 */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-5 px-5 sm:px-8 lg:px-10">
            <a href={homeUrl()} className="flex shrink-0 items-center" title="回 PPA 首頁">
              <img src={asset("/assets/ppc_academy.jpg")} alt="PressPlay Academy" className="h-7 w-auto" />
            </a>
            <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
              <a href={homeUrl()} className="transition-colors hover:text-orange-500">探索</a>
              <a href={homeUrl()} className="transition-colors hover:text-orange-500">每日簽到</a>
              <a href={homeUrl()} className="transition-colors hover:text-orange-500">領券專區</a>
              <Link href="/" className="font-bold text-indigo-600">🏙️ 學習城市</Link>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3">
              <a
                href={midUrl()}
                title="回影片繼續觀課"
                className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 sm:flex"
              >
                ▶ 繼續觀課
              </a>
              <a
                href={homeUrl()}
                title="回 PPA 首頁繼續逛課"
                className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                ← 回首頁
              </a>
              <Link href="/notifications" aria-label="通知" className="relative grid h-11 w-11 place-items-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
              </Link>
              <Link href="/calendar" aria-label="學習日曆" className="hidden h-11 w-11 place-items-center rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100 sm:grid">
                <CalendarDays className="h-5 w-5" />
              </Link>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-sm font-bold text-white">志</div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
