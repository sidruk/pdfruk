"use client";

import type { ProcessProgress } from "@/types/pdf";

import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
  progress: ProcessProgress;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const value =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{progress.message}</span>
        <span className="text-muted-foreground">
          {progress.current} / {progress.total}
        </span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
