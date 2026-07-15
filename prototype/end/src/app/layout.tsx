import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LearningCityProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "學習城市 Learning City",
  description:
    "把每一次學習，累積成一座屬於你的城市。整合學習歷程、課後複習與遊戲化養成。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f0",
};

// paint 前就把主題定好，避免深色閃一下白。
// 三個 app（front/mid/end）共用 localStorage key「ppa-theme」，載入優先序 ?theme= > localStorage > 預設 light。
// 全站固定亮色（landing 以外統一 bright mode）
const themeBoot = `(function(){try{
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme','light');
  localStorage.setItem('ppa-theme','light');
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <LearningCityProvider>
          <AppShell>{children}</AppShell>
        </LearningCityProvider>
      </body>
    </html>
  );
}
