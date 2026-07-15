"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  AppState,
  CategoryId,
  Familiarity,
} from "@/types";
import { createInitialState, seedBuildings, seedCourses, seedFlashcards, seedQuizzes } from "@/data";
import {
  buildingLevelFromMinutes,
  levelFromXp,
  XP_RULES,
} from "@/lib/xp";

// v3：獎勵數值改版（XP 為 5 的倍數、金幣尾數為 0），換 key 讓舊存檔直接改用新種子。
const STORAGE_KEY = "learning-city-state-v3";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
type Action =
  | { type: "COMPLETE_TASK"; taskId: string }
  | { type: "RATE_FLASHCARD"; cardId: string; familiarity: Familiarity }
  | { type: "ANSWER_QUIZ"; quizId: string; correct: boolean }
  | { type: "WATCH_COURSE"; courseId: string; minutes: number }
  | { type: "ADD_NOTE"; note: string; category: CategoryId }
  | { type: "COMEBACK_BONUS"; sourceId: string }
  | { type: "HYDRATE"; state: AppState }
  | { type: "RESET" };

/** Recompute derived fields (user level, building levels) after any change. */
function recompute(state: AppState): AppState {
  const existingCourses = new Map((state.courses ?? []).map((course) => [course.id, course]));
  const courses = seedCourses.map((seed) => ({ ...seed, ...(existingCourses.get(seed.id) ?? {}) }));
  const existingFlashcards = new Map((state.flashcards ?? []).map((card) => [card.id, card]));
  const flashcards = seedFlashcards.map((seed) => ({ ...seed, ...(existingFlashcards.get(seed.id) ?? {}) }));
  const notes = (state.notes ?? []).map((note, index) =>
    typeof note === "string"
      ? { id: `legacy-note-${index}`, body: note, category: "investing" as CategoryId, createdAt: "2026-07-15" }
      : note,
  );
  const buildings = state.buildings.map((b) => {
    const currentMetadata = seedBuildings.find((seed) => seed.id === b.id);
    return {
      ...b,
      ...(currentMetadata
        ? {
            name: currentMetadata.name,
            category: currentMetadata.category,
            color: currentMetadata.color,
          }
        : {}),
      level: buildingLevelFromMinutes(b.minutes),
      unlocked: true,
    };
  });
  return {
    ...state,
    tasks: state.tasks.map((task) => ({
      ...task,
      coins: task.coins ?? Math.max(10, Math.round(task.xp * 1.5)),
    })),
    quizzes:
      state.quizzes?.length > 0 && state.quizzes.every((quiz) => quiz.category)
        ? state.quizzes
        : seedQuizzes,
    answeredQuizIds: state.answeredQuizIds ?? [],
    claimedRewardIds: state.claimedRewardIds ?? [],
    courses,
    flashcards,
    notes,
    buildings,
    user: {
      ...state.user,
      name: "James",
      coins: state.user.coins ?? 0,
      coursesCompleted: courses.filter((course) => course.status === "completed").length,
      coursesInProgress: courses.filter((course) => course.status === "in-progress").length,
      level: levelFromXp(state.user.xp),
    },
  };
}

function addXp(state: AppState, xp: number): AppState {
  return { ...state, user: { ...state.user, xp: state.user.xp + xp } };
}

function growBuilding(
  state: AppState,
  id: CategoryId,
  minutes: number,
): AppState {
  return {
    ...state,
    buildings: state.buildings.map((b) =>
      b.id === id
        ? { ...b, minutes: b.minutes + minutes, unlocked: true }
        : b,
    ),
    user: {
      ...state.user,
      totalMinutes: state.user.totalMinutes + minutes,
      weekMinutes: state.user.weekMinutes + minutes,
    },
  };
}

function logActivity(
  state: AppState,
  entry: AppState["activity"][number],
): AppState {
  return { ...state, activity: [entry, ...state.activity].slice(0, 30) };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return recompute(action.state);

    case "RESET":
      return recompute(createInitialState());

    case "COMPLETE_TASK": {
      const task = state.tasks.find((t) => t.id === action.taskId);
      if (!task || task.done) return state;
      let next = addXp(state, task.xp);
      next = {
        ...next,
        user: { ...next.user, coins: next.user.coins + task.coins },
      };
      next = {
        ...next,
        tasks: next.tasks.map((t) =>
          t.id === action.taskId ? { ...t, done: true } : t,
        ),
      };
      next = logActivity(next, {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: "task",
            title: `完成任務：${task.title}（+${task.xp} XP、+${task.coins} 金幣）`,
        category: task.buildingId,
      });
      return recompute(next);
    }

    case "RATE_FLASHCARD": {
      const targetCard = state.flashcards.find((card) => card.id === action.cardId);
      if (!targetCard) return state;
      let next = targetCard.familiarity ? state : addXp(state, XP_RULES.flashcardSet);
      next = {
        ...next,
        flashcards: next.flashcards.map((c) =>
          c.id === action.cardId
            ? { ...c, familiarity: action.familiarity }
            : c,
        ),
      };
      const reviewed = next.flashcards.filter((c) => c.familiarity).length;
      next = {
        ...next,
        user: {
          ...next.user,
          flashcardsDue: Math.max(0, next.flashcards.length - reviewed),
        },
      };
      return recompute(next);
    }

    case "ANSWER_QUIZ": {
      if ((state.answeredQuizIds ?? []).includes(action.quizId)) return state;
      let next = addXp(state, action.correct ? XP_RULES.dailyQuestion : 5);
      const quizzesDone = next.user.quizzesDone + 1;
      // Rolling accuracy estimate for the demo.
      const totalCorrect =
        Math.round((next.user.accuracy / 100) * next.user.quizzesDone) +
        (action.correct ? 1 : 0);
      next = {
        ...next,
        answeredQuizIds: [...(next.answeredQuizIds ?? []), action.quizId],
        user: {
          ...next.user,
          quizzesDone,
          accuracy: Math.round((totalCorrect / quizzesDone) * 100),
        },
      };
      return recompute(next);
    }

    case "WATCH_COURSE": {
      const course = state.courses.find((c) => c.id === action.courseId);
      if (!course) return state;
      let next = addXp(state, action.minutes * XP_RULES.watchPerMinute);
      next = growBuilding(next, course.category, action.minutes);
      next = {
        ...next,
        courses: next.courses.map((c) =>
          c.id === action.courseId
            ? {
                ...c,
                progress: Math.min(100, c.progress + 10),
                minutesLeft: Math.max(0, c.minutesLeft - action.minutes),
                lastWatchedAt: new Date().toISOString().slice(0, 10),
                status:
                  c.progress + 10 >= 100 ? "completed" : c.status,
              }
            : c,
        ),
      };
      next = logActivity(next, {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: "watch",
        title: `觀看《${course.title}》`,
        minutes: action.minutes,
        category: course.category,
      });
      return recompute(next);
    }

    case "ADD_NOTE": {
      let next = addXp(state, XP_RULES.note);
      next = {
        ...next,
        notes: [
          {
            id: `note-${Date.now()}`,
            body: action.note,
            category: action.category,
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...next.notes,
        ],
      };
      next = logActivity(next, {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: "note",
        title: "新增一則學習筆記",
        category: action.category,
      });
      return recompute(next);
    }

    case "COMEBACK_BONUS": {
      if ((state.claimedRewardIds ?? []).includes(action.sourceId)) return state;
      const next = addXp(state, XP_RULES.comeback);
      return recompute(
        logActivity({ ...next, claimedRewardIds: [...(next.claimedRewardIds ?? []), action.sourceId] }, {
          id: `act-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          type: "review",
          title: "重新回到學習城市，獲得回歸獎勵 +20 XP",
        }),
      );
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface StoreValue {
  state: AppState;
  hydrated: boolean;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function LearningCityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    recompute(createInitialState()),
  );
  const hydratedRef = useRef(false);

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as AppState });
    } catch {
      // Corrupt storage → fall back to seed state silently.
    }
    hydratedRef.current = true;
  }, []);

  // Persist on every change (after initial hydrate).
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full / unavailable → ignore, app still works in-memory.
    }
  }, [state]);

  return (
    <StoreContext.Provider
      value={{ state, dispatch, hydrated: hydratedRef.current }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error("useStore must be used within a LearningCityProvider");
  return ctx;
}

// Convenience selectors -------------------------------------------------------
export function useBuilding(id: CategoryId) {
  const { state } = useStore();
  return state.buildings.find((b) => b.id === id);
}
