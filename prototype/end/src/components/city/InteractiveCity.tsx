"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Sparkles } from "lucide-react";
import type { Building, CategoryId } from "@/types";
import { asset } from "@/lib/asset";

/**
 * 建築定位設定
 * ------------------------------------------------------------------
 * 底圖 learning-city-map.png 本身已經畫好 8 棟建築 + 噴水池。
 * 我們「不再」疊上另一張建築素材（那會造成重複屋頂），
 * 而是在底圖對應建築上放一個透明的可點擊熱區，名稱標籤浮在上方。
 *
 * 座標系統：全部以「地圖容器左上角」為原點，使用百分比。
 *   left / top  = 建築視覺中心（%）
 *   width       = 熱區寬度（%），height 依 heightRatio 換算
 * 底圖為 1448 x 1086（4:3），容器以原始比例顯示，不裁切。
 */
type BuildingPosition = {
  left: number; // 視覺中心 X（%）
  top: number; // 視覺中心 Y（%）
  width: number; // 點擊熱區寬度（%）
  height: number; // 點擊熱區高度（%）
  labelOffset?: number; // 標籤額外上移（%），預設貼齊熱區頂端
};

const BUILDING_POSITIONS: Record<CategoryId, BuildingPosition> = {
  investing: { left: 45, top: 19, width: 22, height: 26 }, // 財富銀行（上方藍頂）
  language: { left: 24, top: 36, width: 20, height: 24 }, // 語言圖書館（左，對話氣泡）
  baking: { left: 69, top: 29, width: 20, height: 24 }, // 烘焙坊（右上，杯子蛋糕頂）
  fitness: { left: 84, top: 47, width: 19, height: 22 }, // 活力健身房（右，啞鈴）
  career: { left: 48, top: 47, width: 21, height: 24 }, // 職場大樓（中央，大書本）
  lifestyle: { left: 23, top: 62, width: 21, height: 24 }, // 質感生活館（左下，畫盤）
  digital: { left: 70, top: 62, width: 22, height: 24 }, // 行銷研究所（右下，科技樓）
  beauty: { left: 48, top: 76, width: 16, height: 16, labelOffset: 2 }, // 藝文廣場（噴水池）
};

// 設 true 時，每個熱區會顯示半透明紅框，方便對齊校正；正式版設 false。
const DEBUG = false;

export function InteractiveCity({
  buildings,
  pending = [],
}: {
  buildings: Building[];
  pending?: CategoryId[];
}) {
  return (
    <div className="relative mx-auto w-full max-w-[900px] overflow-hidden rounded-[30px] shadow-[0_24px_60px_-28px_rgba(14,116,144,.58)]">
      {/* 底圖：原始比例顯示，不使用 object-cover 以免座標漂移 */}
      <Image
        src={asset("/assets/learning-city-map.png")}
        alt="學習城市地圖"
        width={1448}
        height={1086}
        priority
        unoptimized
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="block h-auto w-full select-none"
      />

      {buildings.map((building) => {
        const pos = BUILDING_POSITIONS[building.id];
        if (!pos) return null;
        return (
          <Link
            key={building.id}
            href={`/building/${building.id}`}
            aria-label={`進入${building.name}`}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: `${pos.width}%`,
              height: `${pos.height}%`,
            }}
          >
            {/* 點擊 / hover 的柔光範圍 */}
            <span
              className={`absolute inset-0 rounded-[28%] transition duration-300 group-hover:bg-white/15 group-hover:ring-2 group-hover:ring-white/70 group-hover:ring-offset-0 group-focus-visible:bg-white/20 group-focus-visible:ring-2 group-focus-visible:ring-white/80 ${
                DEBUG ? "bg-red-500/25 ring-2 ring-red-500" : ""
              }`}
            />

            {/* 名稱 + 等級標籤（獨立定位，浮在建築上方，不綁進建築圖） */}
            <span
              className="absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-xl border border-white/70 bg-white/95 px-2.5 py-1.5 text-xs font-black text-slate-800 shadow-[0_8px_22px_rgba(15,23,42,.2)] backdrop-blur transition duration-300 group-hover:scale-105"
              style={{ bottom: `calc(100% + ${8 + (pos.labelOffset ?? 0)}px)` }}
            >
              {building.name}
              {building.unlocked ? (
                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-700">
                  Lv.{building.level}
                </span>
              ) : (
                <>
                  {pending.includes(building.id) && (
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-slate-100 text-slate-400">
                    <Lock className="h-3 w-3" />
                  </span>
                </>
              )}
            </span>
          </Link>
        );
      })}

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-[11px] font-bold text-slate-600 shadow-lg backdrop-blur">
        點擊建築探索課程
      </div>
    </div>
  );
}
