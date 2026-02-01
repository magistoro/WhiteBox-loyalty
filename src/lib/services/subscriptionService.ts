import { activeSubscriptions, subscriptions } from "@/lib/mockData";

/**
 * Тип расширенной активной подписки с вычисленными датами
 */
export interface ActiveSubscriptionWithDates {
  subscriptionId: string;
  companyIds: string[];
  sub: typeof subscriptions[0];
  startDate: string;
  endDate: string;
}

/**
 * Функция вычисляет дату окончания подписки исходя из activatedAt и renewalPeriod
 */
export function getActiveSubscriptionsWithEndDates(): ActiveSubscriptionWithDates[] {
  return activeSubscriptions
    .map((activeSub) => {
      const sub = subscriptions.find((s) => s.id === activeSub.subscriptionId);
      if (!sub) return null;

      const start = new Date(activeSub.activatedAt);
      const end = new Date(start);

      switch (sub.renewalPeriod) {
        case "day":
          end.setDate(end.getDate() + 1);
          break;
        case "week":
          end.setDate(end.getDate() + 7);
          break;
        case "month":
          end.setMonth(end.getMonth() + 1);
          break;
        default:
          throw new Error(`Unknown renewal period: ${sub.renewalPeriod}`);
      }

      return {
        subscriptionId: activeSub.subscriptionId,
        companyIds: activeSub.companyIds,
        sub,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    })
    .filter(Boolean) as ActiveSubscriptionWithDates[];
}
