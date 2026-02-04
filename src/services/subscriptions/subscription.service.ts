import { activeSubscriptions } from "@/lib/mockData";

export interface ActiveSubscriptionRecord {
  subscriptionId: string;
  activatedAt: string;
  expiresAt: string;
  renewPeriodDays: number;
  willAutoRenew?: boolean;
  status: string;
  companyIds: string[];
}

export interface ExpiredSubscriptionRecord extends ActiveSubscriptionRecord {
  status: "expired";
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

/**
 * Returns only active (non-expired) subscriptions.
 * activeSubscriptions from mockData is filtered to exclude expired ones.
 */
export function getActiveSubscriptions(): ActiveSubscriptionRecord[] {
  return activeSubscriptions.filter((a) => !isExpired(a.expiresAt));
}

/**
 * Returns expired subscriptions with status "expired".
 * Does not mutate source data; adds derived status when returning.
 */
export function getExpiredSubscriptions(): ExpiredSubscriptionRecord[] {
  return activeSubscriptions
    .filter((a) => isExpired(a.expiresAt))
    .map((a) => ({
      ...a,
      status: "expired" as const,
    }));
}
