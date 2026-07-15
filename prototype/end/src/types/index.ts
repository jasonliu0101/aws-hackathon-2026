// ============================================================================
// Learning City — Core Domain Types
// One source of truth for every entity the app renders and mutates.
// ============================================================================

/** The 8 learning categories, each mapped 1:1 to a city building. */
export type CategoryId =
  | "investing"
  | "career"
  | "language"
  | "baking"
  | "beauty"
  | "fitness"
  | "lifestyle"
  | "digital";

/** A building grows from level 1 → 5 as its category accrues learning minutes. */
export type BuildingLevel = 1 | 2 | 3 | 4 | 5;

export interface Building {
  id: CategoryId;
  /** Display name, e.g. 投資銀行 */
  name: string;
  /** Human-readable category label, e.g. 投資理財 */
  category: string;
  emoji: string;
  /** Tailwind-friendly accent color (hex) used by the tile renderer. */
  color: string;
  /** Whether the user has ever watched a course in this category. */
  unlocked: boolean;
  level: BuildingLevel;
  /** Total minutes learned in this category (drives level). */
  minutes: number;
  /** Chapters completed in this category. */
  chaptersDone: number;
  /** Title of the most recently watched course in this category. */
  lastCourse?: string;
}

export type CourseStatus = "in-progress" | "completed" | "review";

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: CategoryId;
  /** 0–100 */
  progress: number;
  /** ISO date string of the last watch session. */
  lastWatchedAt: string;
  /** Minutes of content remaining. */
  minutesLeft: number;
  status: CourseStatus;
  /** Where the user paused, e.g. "ETF 的風險分散 12:34" */
  resumePoint?: string;
  /** Recent playback interruptions reported by the video player. */
  playbackStalls?: number;
}

export type Familiarity = "known" | "fuzzy" | "forgot";

export interface Flashcard {
  id: string;
  courseId: string;
  front: string;
  back: string;
  /** Last self-rated familiarity; undefined = not reviewed yet. */
  familiarity?: Familiarity;
}

export interface Quiz {
  id: string;
  courseId: string;
  /** Building/domain this quiz belongs to. */
  category: CategoryId;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export type ActivityType =
  | "watch"
  | "task"
  | "note"
  | "quiz"
  | "review"
  | "upgrade";

export interface ActivityEntry {
  id: string;
  date: string; // ISO date (day granularity)
  type: ActivityType;
  title: string;
  /** Minutes spent, when relevant. */
  minutes?: number;
  category?: CategoryId;
}

export type TaskKind = "review" | "watch" | "quiz" | "note";

export interface DailyTask {
  id: string;
  kind: TaskKind;
  title: string;
  /** Estimated minutes to complete. */
  estMinutes: number;
  /** Why this task matters — shown to reduce friction. */
  purpose: string;
  /** Reward copy, e.g. 學習卡工坊獲得 20 點建設值 */
  reward: string;
  xp: number;
  /** Coins granted immediately when this task is completed. */
  coins: number;
  /** Building that grows on completion. */
  buildingId: CategoryId;
  done: boolean;
}

export type NotificationTier = "short" | "mid" | "long";

export interface ReturnNotification {
  id: string;
  tier: NotificationTier;
  /** Human label, e.g. 離開 30 分鐘 */
  timeframe: string;
  body: string;
  cta: string;
  /** Where the CTA deep-links to. */
  target: "resume" | "flashcards" | "highlight" | "task";
}

/** Persisted, mutable user progress. Everything here is saved to localStorage. */
export interface User {
  name: string;
  level: number;
  xp: number;
  coins: number;
  totalMinutes: number;
  weekMinutes: number;
  coursesCompleted: number;
  coursesInProgress: number;
  flashcardsDue: number;
  quizzesDone: number;
  accuracy: number;
}

/** The complete app state we persist and hydrate. */
export interface AppState {
  user: User;
  buildings: Building[];
  courses: Course[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  /** Prevents repeated XP rewards for answering the same question. */
  answeredQuizIds: string[];
  tasks: DailyTask[];
  activity: ActivityEntry[];
  notes: string[];
}
