import type { BuildingLevel } from "@/types";

// ============================================================================
// Gamification rules — single source for XP and level thresholds.
// ============================================================================

/** XP awarded per learning action. Mirrors the product spec. */
export const XP_RULES = {
  watchPerMinute: 2,
  flashcardSet: 10,
  dailyQuestion: 10,
  chapter: 20,
  note: 10,
  courseComplete: 100,
  /** Positive reinforcement for returning after a break — never a penalty. */
  comeback: 20,
} as const;

/** City level curve: 200 XP per level (simple, legible for the demo). */
export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 200) + 1);
}

export function xpIntoLevel(xp: number): { current: number; needed: number } {
  const current = xp % 200;
  return { current, needed: 200 };
}

/**
 * A building's level (1–5) is derived from cumulative minutes in its category.
 * Thresholds are spaced so early growth feels fast, later growth feels earned.
 */
const BUILDING_THRESHOLDS = [0, 60, 180, 360, 600] as const;

export function buildingLevelFromMinutes(minutes: number): BuildingLevel {
  let level: BuildingLevel = 1;
  for (let i = 0; i < BUILDING_THRESHOLDS.length; i++) {
    if (minutes >= BUILDING_THRESHOLDS[i]) level = (i + 1) as BuildingLevel;
  }
  return level;
}

/** Minutes remaining until the next building level, or null if maxed. */
export function minutesToNextLevel(minutes: number): number | null {
  for (const t of BUILDING_THRESHOLDS) {
    if (minutes < t) return t - minutes;
  }
  return null;
}

export function nextLevelThreshold(minutes: number): number | null {
  for (const t of BUILDING_THRESHOLDS) {
    if (minutes < t) return t;
  }
  return null;
}
