import type { CategoryId } from "@/types";
import { BuildingDetailClient } from "./BuildingDetailClient";

// 靜態匯出 (output: "export") 需要預先列出所有動態路由參數。
const CATEGORY_IDS: CategoryId[] = [
  "investing",
  "career",
  "language",
  "baking",
  "beauty",
  "fitness",
  "lifestyle",
  "digital",
];

export function generateStaticParams() {
  return CATEGORY_IDS.map((id) => ({ id }));
}

export default function BuildingDetailPage() {
  return <BuildingDetailClient />;
}
