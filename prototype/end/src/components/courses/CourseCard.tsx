"use client";

import { Play, Clock, RotateCcw, CheckCircle2 } from "lucide-react";
import type { Building, Course } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function CourseCard({
  course,
  building,
  onWatch,
}: {
  course: Course;
  building?: Building;
  onWatch: (course: Course) => void;
}) {
  const done = course.status === "completed";

  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span>{building?.emoji ?? "📘"}</span>
              <h3 className="truncate font-semibold">{course.title}</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {course.instructor} · {building?.category ?? "課程"}
            </p>
          </div>
          {done ? (
            <Badge variant="mint">
              <CheckCircle2 className="h-3 w-3" />
              已完成
            </Badge>
          ) : (
            <Badge variant="secondary">{course.progress}%</Badge>
          )}
        </div>

        {!done && (
          <div className="mt-3">
            <Progress value={course.progress} className="h-1.5" />
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />剩 {course.minutesLeft} 分
              </span>
              <span>上次觀看 {formatDate(course.lastWatchedAt)}</span>
            </div>
          </div>
        )}

        <div className="mt-3">
          {done ? (
            <Button variant="outline" size="sm" className="w-full" onClick={() => onWatch(course)}>
              <RotateCcw className="h-3.5 w-3.5" />
              複習這門課
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={() => onWatch(course)}>
              <Play className="h-3.5 w-3.5" />
              繼續觀看
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
