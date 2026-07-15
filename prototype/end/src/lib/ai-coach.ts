import type { DailyTask, Building, Course, User } from "@/types";
import type { CategoryId } from "@/types";

/**
 * AI Coach generates personalized daily tasks based on user profile.
 * Each user gets different tasks that match their learning level and goals.
 */

interface CoachContext {
  user: User;
  buildings: Building[];
  courses?: Course[];
  completedTasks: string[];
}

const taskTemplates: Record<string, DailyTask> = {
  // Review tasks
  review_short: {
    id: "",
    kind: "review",
    title: "",
    estMinutes: 3,
    purpose: "趁記憶還新鮮時鞏固，隔天複習能大幅提升長期記憶。",
    reward: "",
    xp: 20,
    coins: 30,
    buildingId: "investing",
    done: false,
  },
  review_medium: {
    id: "",
    kind: "review",
    title: "",
    estMinutes: 5,
    purpose: "定期複習能將短期記憶轉換為長期記憶。",
    reward: "",
    xp: 25,
    coins: 40,
    buildingId: "career",
    done: false,
  },

  // Watch tasks
  watch_finish: {
    id: "",
    kind: "watch",
    title: "",
    estMinutes: 4,
    purpose: "只差一小段就能完成整個章節，建築即將升級。",
    reward: "",
    xp: 20,
    coins: 30,
    buildingId: "language",
    done: false,
  },
  watch_new: {
    id: "",
    kind: "watch",
    title: "",
    estMinutes: 10,
    purpose: "開始新課程，穩定的學習進度最重要。",
    reward: "",
    xp: 40,
    coins: 60,
    buildingId: "baking",
    done: false,
  },

  // Quiz tasks
  quiz_checkpoint: {
    id: "",
    kind: "quiz",
    title: "",
    estMinutes: 3,
    purpose: "用測驗檢查自己是否真的理解，比重看一次更有效。",
    reward: "",
    xp: 15,
    coins: 20,
    buildingId: "beauty",
    done: false,
  },

  // Note tasks
  note_reflection: {
    id: "",
    kind: "note",
    title: "",
    estMinutes: 4,
    purpose: "用自己的話寫下來，是把知識變成能力的關鍵一步。",
    reward: "",
    xp: 20,
    coins: 30,
    buildingId: "fitness",
    done: false,
  },
};

const buildingNames: Record<CategoryId, string> = {
  investing: "財富銀行",
  career: "職場大樓",
  language: "語言圖書館",
  baking: "烘焙坊",
  beauty: "藝文廣場",
  fitness: "活力健身房",
  lifestyle: "質感生活館",
  digital: "行銷研究所",
};

const courseNames: Record<CategoryId, string[]> = {
  investing: [
    "ETF 投資入門",
    "股市基礎知識",
    "風險管理策略",
    "退休理財規劃",
  ],
  career: [
    "職場溝通技巧",
    "需求訪談方法",
    "AI 工具提升工作效率",
    "專案管理基礎",
  ],
  language: [
    "日常會話訓練",
    "商務英文",
    "語法進階",
    "文化交流課程",
  ],
  baking: [
    "麵包烘焙基礎",
    "蛋糕裝飾技巧",
    "甜點製作入門",
    "烘焙工具使用",
  ],
  beauty: [
    "化妝基礎教學",
    "護膚知識",
    "化妝品選擇",
    "妝容搭配技巧",
  ],
  fitness: [
    "居家健身訓練",
    "瑜伽入門",
    "健身營養學",
    "運動傷害預防",
  ],
  lifestyle: [
    "居家佈置靈感",
    "手作工藝教學",
    "生活品質提升",
    "斷捨離實踐",
  ],
  digital: [
    "AI 工具入門",
    "數位行銷基礎",
    "程式設計初階",
    "數據分析概論",
  ],
};

/**
 * Generate personalized daily tasks for the user based on their progress.
 */
export function generateDailyTasks(context: CoachContext): DailyTask[] {
  const tasks: DailyTask[] = [];
  const { user, buildings, courses = [] } = context;

  // Find the weakest building (lowest level) to focus on
  const weakestBuilding = buildings.reduce((prev, curr) =>
    curr.level < prev.level ? curr : prev
  );

  // Find the strongest building (highest level) for reinforcement
  const strongestBuilding = buildings.reduce((prev, curr) =>
    curr.level > prev.level ? curr : prev
  );

  // Task 1: prioritize a short recovery task when the player reports stalls.
  const stalledCourse = courses
    .filter((course) => course.status === "in-progress" && (course.playbackStalls ?? 0) >= 2)
    .sort((a, b) => (b.playbackStalls ?? 0) - (a.playbackStalls ?? 0))[0];

  if (stalledCourse) {
    tasks.push({
      ...taskTemplates.watch_finish,
      id: "daily-playback-recovery",
      title: `從《${stalledCourse.title}》上次中斷處接著看 3 分鐘`,
      purpose: `偵測到影片最近中斷 ${stalledCourse.playbackStalls} 次，先安排短片段並保留進度，降低重新開始的負擔。`,
      buildingId: stalledCourse.category,
      estMinutes: 3,
      xp: 30,
      coins: 40,
      reward: `${buildingNames[stalledCourse.category]}獲得 30 點建設值`,
    });
  }

  // Task 2: Review task for strongest building (reinforcement)
  if (strongestBuilding.level >= 2) {
    const reviewTask = {
      ...taskTemplates.review_short,
      id: "daily-review",
      title: `花 3 分鐘複習昨天學過的 ${buildingNames[strongestBuilding.id]} 觀念`,
      buildingId: strongestBuilding.id,
      reward: `${buildingNames[strongestBuilding.id]}獲得 20 點建設值`,
    };
    tasks.push(reviewTask);
  }

  // Task 2: Watch task for weakest building (progress)
  if (weakestBuilding.minutes < 100) {
    // Still early in the journey
    const courses = courseNames[weakestBuilding.id];
    const courseIdx = Math.floor(weakestBuilding.minutes / 30) % courses.length;
    const watchTask = {
      ...taskTemplates.watch_finish,
      id: "daily-watch",
      title: `看完《${courses[courseIdx]}》剩下的 4 分鐘完成本章`,
      buildingId: weakestBuilding.id,
      xp: 20 + weakestBuilding.level * 5,
      coins: 30 + weakestBuilding.level * 10,
      reward: `${buildingNames[weakestBuilding.id]}獲得 ${20 + weakestBuilding.level * 5} 點建設值`,
      estMinutes: Math.max(3, 5 - weakestBuilding.level),
    };
    tasks.push(watchTask);
  }

  // Task 3: Quiz or Note task
  // Keep the initial result deterministic so server and browser render the same task list.
  // A real API can replace this seed-based choice later.
  const profileSeed = (user.xp + user.totalMinutes + user.quizzesDone) % buildings.length;
  const randomBuilding = buildings[profileSeed];

  if (user.quizzesDone < 10) {
    // Encourage quiz practice for new users
    const quizTask = {
      ...taskTemplates.quiz_checkpoint,
      id: "daily-quiz",
      title: `回答一題 ${buildingNames[randomBuilding.id]} 的小測驗`,
      buildingId: randomBuilding.id,
      xp: 15,
      coins: 20,
      reward: `${buildingNames[randomBuilding.id]}獲得 15 點建設值`,
    };
    tasks.push(quizTask);
  } else {
    // Encourage note-taking for experienced users
    const courses = courseNames[randomBuilding.id];
    const courseIdx = profileSeed % courses.length;
    const noteTask = {
      ...taskTemplates.note_reflection,
      id: "daily-note",
      title: `為《${courses[courseIdx]}》寫一句學習筆記`,
      buildingId: randomBuilding.id,
      xp: 20,
      coins: 30,
      reward: `${buildingNames[randomBuilding.id]}獲得 20 點建設值`,
    };
    tasks.push(noteTask);
  }

  // Task 4: Bonus task based on streak (learning consistency)
  if (user.totalMinutes > 60) {
    const bonusBuilding = buildings[(profileSeed + 3) % buildings.length];
    const bonusTask = {
      ...taskTemplates.watch_new,
      id: "daily-bonus",
      title: `探索新課程：${courseNames[bonusBuilding.id][0]}`,
      buildingId: bonusBuilding.id,
      xp: 40,
      coins: 60,
      reward: `${buildingNames[bonusBuilding.id]}獲得 40 點建設值`,
      estMinutes: 8,
    };
    tasks.push(bonusTask);
  }

  return tasks.slice(0, 4);
}

/**
 * Get personalized motivation message based on user progress.
 */
export function getMotivationMessage(context: CoachContext): string {
  const { user, buildings } = context;
  const avgLevel =
    buildings.reduce((sum, b) => sum + b.level, 0) / buildings.length;

  if (user.totalMinutes === 0) {
    return "歡迎來到學習城市！今天就開始第一堂課吧，每一分鐘都會讓城市成長。";
  } else if (avgLevel >= 4) {
    return "你已經成為學習高手了！保持這份熱情，往 Lv.5 邁進！";
  } else if (avgLevel >= 3) {
    return "非常棒的進度！再堅持一下，你就要升級了。";
  } else if (user.totalMinutes > 30) {
    return "你在路上了！選一棟建築繼續深耕，很快就會看到成果。";
  } else {
    return "開始很重要，每一次學習都在累積。今天就再學 5 分鐘吧！";
  }
}
