/**
 * Computes subscription period progress from active subscription data.
 * Uses: subscriptionId, activatedAt, expiresAt, renewPeriodDays
 */

export interface ActiveSubscriptionProgressInput {
  expiresAt: string;
  renewPeriodDays: number;
}

export interface SubscriptionProgress {
  daysTotal: number;
  daysPassed: number;
  daysLeft: number;
  percent: number; // passed (0–100)
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function floorDays(ms: number): number {
  return Math.floor(ms / MS_PER_DAY);
}

/**
 * Computes progress for an active subscription.
 * percent = daysPassed / renewPeriodDays * 100
 */
export function computeSubscriptionProgress(
  input: ActiveSubscriptionProgressInput
): SubscriptionProgress {
  const { expiresAt, renewPeriodDays } = input;
  const daysTotal = renewPeriodDays;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const msLeft = expiry.getTime() - now.getTime();
  const daysLeft = Math.max(0, floorDays(msLeft));
  const daysPassed = Math.max(0, daysTotal - daysLeft);
  const percent = daysTotal > 0 ? (daysPassed / daysTotal) * 100 : 0;

  return { daysTotal, daysPassed, daysLeft, percent };
}
