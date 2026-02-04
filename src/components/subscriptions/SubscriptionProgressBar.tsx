"use client";

import { Progress } from "@/components/ui/progress";
import type { SubscriptionProgress } from "@/services/subscriptions/subscription.progress";

interface SubscriptionProgressBarProps {
  progress: SubscriptionProgress;
  className?: string;
}

/**
 * Displays "X days left" label and a horizontal progress bar
 * representing remaining subscription lifetime (0–100%).
 */
export function SubscriptionProgressBar({
  progress,
  className,
}: SubscriptionProgressBarProps) {
  const { daysLeft, daysTotal } = progress;
  const percentRemaining = daysTotal > 0 ? (daysLeft / daysTotal) * 100 : 0;
  const clampedPercent = Math.min(100, Math.max(0, percentRemaining));

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">
        {daysLeft === 0
          ? "Expires today"
          : daysLeft === 1
            ? "1 day left"
            : `${daysLeft} days left`}
      </p>
      <Progress value={clampedPercent} className="h-1.5" />
    </div>
  );
}
