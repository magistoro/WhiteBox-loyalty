"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminFindSubscriptionByUuid, adminSubscriptionStats } from "@/lib/api/admin-client";

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    expired: number;
    canceled: number;
  } | null>(null);
  const [uuid, setUuid] = useState("");
  const [result, setResult] = useState<{
    uuid: string;
    name: string;
    slug: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    void (async () => setStats(await adminSubscriptionStats()))();
  }, []);

  async function onFind() {
    setResult(await adminFindSubscriptionByUuid(uuid));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Subscriptions</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: stats?.total ?? 0 },
          { label: "Active", value: stats?.active ?? 0 },
          { label: "Expired", value: stats?.expired ?? 0 },
          { label: "Canceled", value: stats?.canceled ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="glass border-white/10">
            <CardContent className="py-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Find subscription by UUID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Subscription UUID"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
            />
            <Button variant="secondary" onClick={onFind} className="sm:min-w-24">
              Find
            </Button>
          </div>
          {result && (
            <div className="rounded-lg border border-white/10 bg-muted/10 p-3 text-sm">
              <p className="font-semibold">{result.name}</p>
              <p className="text-muted-foreground">Slug: {result.slug}</p>
              <p className="font-mono text-xs">{result.uuid}</p>
              <p className="mt-1 text-muted-foreground">{result.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
