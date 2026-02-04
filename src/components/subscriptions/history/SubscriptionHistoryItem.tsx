"use client";

import Link from "next/link";
import { getCompanyById } from "@/lib/mockData";
import type { ExpiredSubscriptionRecord } from "@/services/subscriptions/subscription.service";
import type { Subscription } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatExpirationDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface SubscriptionHistoryItemProps {
  record: ExpiredSubscriptionRecord;
  sub: Subscription;
}

export function SubscriptionHistoryItem({ record, sub }: SubscriptionHistoryItemProps) {
  const { subscriptionId, expiresAt, companyIds } = record;

  return (
    <Link href={`/marketplace/${subscriptionId}`}>
      <Card className="glass border-white/5 transition-all hover:border-white/10">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{sub.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Expired {formatExpirationDate(expiresAt)}
              </p>
              {companyIds.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {companyIds
                    .map((id) => getCompanyById(id)?.name ?? id)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 text-[10px] font-normal opacity-80"
            >
              Expired
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
