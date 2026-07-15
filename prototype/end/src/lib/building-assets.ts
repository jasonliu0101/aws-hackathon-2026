import type { CategoryId } from "@/types";
import { asset } from "@/lib/asset";

export const BUILDING_ASSETS: Record<CategoryId, string> = {
  investing: asset("/assets/buildings/investing.webp"),
  language: asset("/assets/buildings/language.webp"),
  baking: asset("/assets/buildings/baking.webp"),
  fitness: asset("/assets/buildings/fitness.webp"),
  lifestyle: asset("/assets/buildings/lifestyle.webp"),
  career: asset("/assets/buildings/career.webp"),
  digital: asset("/assets/buildings/digital.webp"),
  beauty: asset("/assets/buildings/beauty.webp"),
};
