"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Crown,
  Gauge,
  Layers3,
  Repeat2,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  adminFindSubscriptionByUuid,
  adminSubscriptionStats,
  type AdminSubscriptionStats,
} from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

type ForecastScenario = "base" | "optimistic" | "risk";
type SlaState = "on_track" | "at_risk" | "off_track";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function slaBadgeClass(sla: SlaState) {
  if (sla === "on_track") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (sla === "at_risk") return "bg-amber-500/15 text-amber-200 border-amber-500/40";
  return "bg-rose-500/15 text-rose-200 border-rose-500/40";
}

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<AdminSubscriptionStats | null>(null);
  const [uuid, setUuid] = useState("");
  const [result, setResult] = useState<{
    uuid: string;
    name: string;
    slug: string;
    description: string;
  } | null>(null);
  const [scenario, setScenario] = useState<ForecastScenario>("base");

  useEffect(() => {
    void (async () => setStats(await adminSubscriptionStats()))();
  }, []);

  async function onFind() {
    setResult(await adminFindSubscriptionByUuid(uuid));
  }

  const selectedForecast = useMemo(() => {
    if (!stats) {
      return { days30: 0, days90: 0 };
    }
    return stats.forecast[scenario];
  }, [scenario, stats]);

  const kpiCards = [
    {
      label: "Total subscriptions",
      value: formatNumber(stats?.total ?? 0),
      hint: "All subscription assignments",
      icon: Layers3,
      accent: "from-sky-500/20 to-cyan-500/10",
    },
    {
      label: "Active now",
      value: formatNumber(stats?.active ?? 0),
      hint: `${stats?.activeRatePercent ?? 0}% of total`,
      icon: Activity,
      accent: "from-emerald-500/20 to-lime-500/10",
    },
    {
      label: "Est. monthly revenue",
      value: formatRevenue(stats?.estimatedMonthlyRevenue ?? 0),
      hint: "Normalized by renewal unit",
      icon: CircleDollarSign,
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      label: "Avg revenue / active",
      value: formatRevenue(stats?.averageMonthlyRevenuePerActive ?? 0),
      hint: "Per active subscription",
      icon: TrendingUp,
      accent: "from-violet-500/20 to-fuchsia-500/10",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <Card className="glass border-white/10 overflow-hidden">
        <CardContent className="relative p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.16),transparent_35%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                Subscription analytics cockpit
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Subscriptions Intelligence
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                KPI targets, SLA health, forecasting and concentration risk in one screen.
              </p>
            </div>
            <Badge variant="outline" className="w-fit border-white/20 bg-white/5 text-xs">
              Updated: {formatDateTime(stats?.generatedAt)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => (
          <Card key={item.label} className="glass border-white/10 overflow-hidden">
            <CardContent className="relative py-5">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", item.accent)} />
              <div className="relative">
                <div className="mb-3 inline-flex rounded-lg border border-white/20 bg-black/20 p-2">
                  <item.icon className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="glass border-white/10 xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              KPI Targets & SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Auto-renew rate</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] border",
                    slaBadgeClass(stats?.kpi?.sla?.autoRenew ?? "off_track"),
                  )}
                >
                  {(stats?.kpi?.sla?.autoRenew ?? "n/a").replace("_", " ")}
                </Badge>
              </div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Actual: {stats?.kpi?.actual?.autoRenewRatePercent ?? 0}% / Target:{" "}
                  {stats?.kpi?.targets?.autoRenewRatePercent ?? 0}%
                </span>
                <span>{stats?.kpi?.attainment?.autoRenewPercent ?? 0}% attainment</span>
              </div>
              <Progress
                value={Math.min(100, stats?.kpi?.attainment?.autoRenewPercent ?? 0)}
                className="h-2.5 bg-sky-500/20 [&>div]:bg-sky-400"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Churn rate (30 days)</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] border",
                    slaBadgeClass(stats?.kpi?.sla?.churn ?? "off_track"),
                  )}
                >
                  {(stats?.kpi?.sla?.churn ?? "n/a").replace("_", " ")}
                </Badge>
              </div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Actual: {stats?.kpi?.actual?.churnRatePercent ?? 0}% / Target:{" "}
                  {stats?.kpi?.targets?.churnRatePercent ?? 0}% max
                </span>
                <span>{stats?.kpi?.attainment?.churnPercent ?? 0}% attainment</span>
              </div>
              <Progress
                value={Math.min(100, stats?.kpi?.attainment?.churnPercent ?? 0)}
                className="h-2.5 bg-emerald-500/20 [&>div]:bg-emerald-400"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <p className="text-xs text-muted-foreground">Auto-renew enabled</p>
                <p className="mt-1 font-semibold">{formatNumber(stats?.autoRenewEnabled ?? 0)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <p className="text-xs text-muted-foreground">Expiring in 7 days</p>
                <p className="mt-1 font-semibold">{formatNumber(stats?.expiringIn7Days ?? 0)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <p className="text-xs text-muted-foreground">Churned in 30 days</p>
                <p className="mt-1 font-semibold">{formatNumber(stats?.churnedIn30Days ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Concentration Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-muted-foreground">Diversification score</p>
              <p className="mt-1 text-2xl font-semibold">{stats?.concentration?.score ?? 0}</p>
              <Progress
                value={stats?.concentration?.score ?? 0}
                className="mt-2 h-2.5 bg-violet-500/20 [&>div]:bg-violet-400"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Top-3 subscriber share</span>
                <span className="font-semibold">
                  {stats?.concentration?.top3SubscriberSharePercent ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Top-1 revenue share</span>
                <span className="font-semibold">
                  {stats?.concentration?.top1RevenueSharePercent ?? 0}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Higher score means less dependency on a single plan.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="glass border-white/10 xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Revenue Forecast (30 / 90 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "base", label: "Base", icon: Gauge },
                  { key: "optimistic", label: "Optimistic", icon: ArrowUpRight },
                  { key: "risk", label: "Risk", icon: AlertTriangle },
                ] as const
              ).map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  size="sm"
                  variant={scenario === option.key ? "default" : "outline"}
                  className={cn(
                    "gap-1.5",
                    scenario === option.key ? "" : "border-white/20 bg-white/5"
                  )}
                  onClick={() => setScenario(option.key)}
                >
                  <option.icon className="h-3.5 w-3.5" />
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-muted-foreground">Projected 30 days</p>
                <p className="mt-1 text-2xl font-semibold">{formatRevenue(selectedForecast.days30)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-muted-foreground">Projected 90 days</p>
                <p className="mt-1 text-2xl font-semibold">{formatRevenue(selectedForecast.days90)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
              Assumptions: growth signal {stats?.forecast?.assumptions?.startedGrowthPercent ?? 0}
              %, churn {stats?.forecast?.assumptions?.churnRatePercent ?? 0}%.
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Growth Pulse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Started in 30 days</p>
              <p className="mt-1 text-xl font-semibold">{formatNumber(stats?.startedIn30Days ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Previous period</p>
              <p className="mt-1 text-xl font-semibold">
                {formatNumber(stats?.startedInPrevious30Days ?? 0)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <span className="text-muted-foreground">Growth delta</span>
              <span
                className={cn(
                  "font-semibold",
                  (stats?.startedGrowthPercent ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"
                )}
              >
                {(stats?.startedGrowthPercent ?? 0) >= 0 ? "+" : ""}
                {stats?.startedGrowthPercent ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-primary" />
            Top Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topSubscriptions?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3">Plan</th>
                    <th className="pb-2 pr-3">Company</th>
                    <th className="pb-2 pr-3">Slug</th>
                    <th className="pb-2 pr-3 text-right">Active subscribers</th>
                    <th className="pb-2 text-right">Est. monthly revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSubscriptions.map((row, index) => (
                    <tr key={row.uuid} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-3">
                        <div className="inline-flex items-center gap-2 font-medium">
                          {index === 0 && <BadgeCheck className="h-4 w-4 text-emerald-300" />}
                          {row.name}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.companyName ?? "Global catalog"}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                        {row.slug}
                      </td>
                      <td className="py-2 pr-3 text-right">{formatNumber(row.activeSubscribers)}</td>
                      <td className="py-2 text-right">{formatRevenue(row.estimatedMonthlyRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Catalog Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="text-xs text-muted-foreground">Total plans</p>
              <p className="mt-1 font-semibold">{formatNumber(stats?.catalog?.totalPlans ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="text-xs text-muted-foreground">Active plans</p>
              <p className="mt-1 font-semibold">{formatNumber(stats?.catalog?.activePlans ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="text-xs text-muted-foreground">Company-linked</p>
              <p className="mt-1 font-semibold">
                {formatNumber(stats?.catalog?.companyLinkedPlans ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="text-xs text-muted-foreground">Category-linked</p>
              <p className="mt-1 font-semibold">
                {formatNumber(stats?.catalog?.categoryLinkedPlans ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Find Subscription by UUID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Subscription UUID"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
              />
              <Button variant="secondary" onClick={onFind} className="sm:min-w-24">
                <Repeat2 className="mr-1 h-4 w-4" />
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
    </div>
  );
}
