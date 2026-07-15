import type { CategoryId, TaskKind } from "@/types";

export type ReviewTool = "flashcards" | "quiz" | "notes" | "highlights";

export function reviewHref(tool: ReviewTool, category?: CategoryId, taskId?: string) {
  const params = new URLSearchParams({ tool });
  if (category) params.set("category", category);
  if (taskId) params.set("task", taskId);
  return `/review?${params.toString()}`;
}

export function taskHref(buildingId?: CategoryId, taskId?: string) {
  const params = new URLSearchParams();
  if (buildingId) params.set("building", buildingId);
  if (taskId) params.set("task", taskId);
  const query = params.toString();
  return query ? `/tasks?${query}` : "/tasks";
}

export function taskToolHref(kind: TaskKind, buildingId: CategoryId, taskId?: string) {
  if (kind === "quiz") return reviewHref("quiz", buildingId, taskId);
  if (kind === "review") return reviewHref("flashcards", buildingId, taskId);
  if (kind === "note") return reviewHref("notes", buildingId, taskId);
  const params = new URLSearchParams({ category: buildingId });
  if (taskId) params.set("task", taskId);
  return `/courses?${params.toString()}`;
}
