import { cn } from "@/lib/utils";

export function LevelBadge({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-sun/25 px-2.5 py-1 text-xs font-bold text-amber-700",
        className,
      )}
    >
      Lv.{level}
    </span>
  );
}
