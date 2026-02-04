"use client";

import { useMemo } from "react";
import {
  getSubscriptionById,
  getCategoryById,
} from "@/lib/mockData";
import type { CategoryId } from "@/lib/mockData";
import type { ExpiredSubscriptionRecord } from "@/services/subscriptions/subscription.service";
import { SubscriptionHistoryItem } from "./SubscriptionHistoryItem";

type GroupedByCategory = Record<
  string,
  (ExpiredSubscriptionRecord & {
    sub: NonNullable<ReturnType<typeof getSubscriptionById>>;
  })[]
>;

function groupByCategory(
  records: ExpiredSubscriptionRecord[]
): GroupedByCategory {
  const grouped: GroupedByCategory = {};
  for (const record of records) {
    const sub = getSubscriptionById(record.subscriptionId);
    if (!sub) continue;
    const key = sub.categoryId ?? "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ ...record, sub });
  }
  return grouped;
}

interface SubscriptionHistoryListProps {
  expiredSubscriptions: ExpiredSubscriptionRecord[];
  className?: string;
}

const CATEGORY_ORDER: CategoryId[] = [
  "coffee",
  "food",
  "fitness",
  "beauty",
  "barber",
  "pharmacy",
  "retail",
  "other",
];

export function SubscriptionHistoryList({
  expiredSubscriptions,
  className,
}: SubscriptionHistoryListProps) {
  const grouped = useMemo(
    () => groupByCategory(expiredSubscriptions),
    [expiredSubscriptions]
  );

  const categoryOrder = useMemo(() => {
    const keys = Object.keys(grouped);
    return [
      ...CATEGORY_ORDER.filter((id) => keys.includes(id)),
      ...keys.filter((k) => !CATEGORY_ORDER.includes(k as CategoryId)),
    ];
  }, [grouped]);

  if (expiredSubscriptions.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        No expired subscriptions yet.
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {categoryOrder.map((categoryId) => {
          const items = grouped[categoryId];
          if (!items?.length) return null;

          const category = getCategoryById(categoryId as CategoryId);

          return (
            <div key={categoryId}>
              <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
                {category?.name ?? "Other"}
              </p>
              <div className="space-y-2">
                {items.map((item) => {
                  const { sub, ...record } = item;
                  return (
                    <SubscriptionHistoryItem
                      key={record.subscriptionId}
                      record={record}
                      sub={sub}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
