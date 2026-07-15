import type { CategoryId } from "@/types";
import { asset } from "@/lib/asset";

export const BUILDING_ASSETS: Record<CategoryId, string> = {
  investing: asset("/assets/buildings/investing.png"),
  language: asset("/assets/buildings/language.png"),
  baking: asset("/assets/buildings/baking.png"),
  fitness: asset("/assets/buildings/fitness.png"),
  lifestyle: asset("/assets/buildings/lifestyle.png"),
  career: asset("/assets/buildings/career.png"),
  digital: asset("/assets/buildings/digital.png"),
  beauty: asset("/assets/buildings/beauty.png"),
};
