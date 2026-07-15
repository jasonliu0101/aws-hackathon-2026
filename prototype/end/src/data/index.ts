import type { AppState, LearningNote, User } from "@/types";
import { seedBuildings } from "./buildings";
import { seedCourses } from "./courses";
import { seedFlashcards, seedQuizzes } from "./review";
import { seedTasks } from "./tasks";
import { seedActivity } from "./activity";
import { generateDailyTasks } from "@/lib/ai-coach";

export const seedUser: User = {
  name: "James",
  level: 5,
  xp: 940,
  coins: 2680,
  totalMinutes: 685,
  weekMinutes: 142,
  coursesCompleted: 3,
  coursesInProgress: 8,
  flashcardsDue: 8,
  quizzesDone: 14,
  accuracy: 82,
};

/** A fresh, complete AppState. Cloned on every reset so seeds stay immutable. */
export function createInitialState(): AppState {
  const baseState = structuredClone({
    user: seedUser,
    buildings: seedBuildings,
    courses: seedCourses,
    flashcards: seedFlashcards,
    quizzes: seedQuizzes,
    answeredQuizIds: [] as string[],
    claimedRewardIds: [] as string[],
    tasks: seedTasks,
    activity: seedActivity,
    notes: [] as LearningNote[],
  });

  // Generate personalized daily tasks based on user profile
  const personalizedTasks = generateDailyTasks({
    user: baseState.user,
    buildings: baseState.buildings,
    courses: baseState.courses,
    completedTasks: baseState.tasks.filter((t) => t.done).map((t) => t.id),
  });

  // Replace seed tasks with AI-generated personalized tasks
  baseState.tasks = personalizedTasks.length > 0 ? personalizedTasks : baseState.tasks;

  return baseState;
}

export {
  seedBuildings,
  seedCourses,
  seedFlashcards,
  seedQuizzes,
  seedTasks,
  seedActivity,
};
