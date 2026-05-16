"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CircleDollarSign, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  activateTwaSubscription,
  getCachedTwaMarketplace,
  getTwaMarketplace,
  type TwaSubscriptionPlan,
} from "@/lib/api/twa-client";
import { TwaLoadingScreen } from "@/components/twa/TwaLoadingScreen";

function formatPlanPrice(plan: TwaSubscriptionPlan) {
  const unit = plan.renewalUnit || "month";
  return `$${plan.price}/${unit}`;
}

function formatRenewal(plan: TwaSubscriptionPlan) {
  const value = Math.max(1, Number(plan.renewalValue) || 1);
  const unit = plan.renewalUnit || "month";
  return `${value} ${unit}${value > 1 ? "s" : ""}`;
}

function buildBenefits(plan: TwaSubscriptionPlan) {
  const benefits = [
    plan.company ? `Benefits at ${plan.company.name}` : "Benefits across selected partners",
    plan.category ? `${plan.category.name} category access` : "Marketplace subscription access",
    `Renews every ${formatRenewal(plan)}`,
  ];
  if (plan.promoBonusDays > 0) {
    benefits.push(`${plan.promoBonusDays} bonus days included`);
  }
  return benefits;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [plans, setPlans] = useState<TwaSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const cached = getCachedTwaMarketplace();
    if (cached.subscriptions.length) {
      setPlans(cached.subscriptions);
      setLoading(false);
    }
    void getTwaMarketplace().then((data) => {
      if (ignore) return;
      setPlans(data.subscriptions);
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const subscription = useMemo(
    () => plans.find((plan) => plan.uuid === id || plan.slug === id) ?? null,
    [id, plans],
  );

  async function onActivate() {
    if (!subscription || subscription.isOwned) return;
    setActivating(true);
    setError(null);
    setNotice(null);
    const res = await activateTwaSubscription(subscription.uuid);
    setActivating(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setNotice("Subscription activated.");
    setPlans((current) =>
      current.map((plan) => (plan.uuid === subscription.uuid ? { ...plan, isOwned: true } : plan)),
    );
  }

  if (loading && plans.length === 0) {
    return <TwaLoadingScreen title="Loading subscription" subtitle="Preparing plan details and activation status." />;
  }

  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-full flex-col items-center justify-center px-6"
      >
        <p className="mb-4 text-muted-foreground">Subscription not found.</p>
        <Button asChild variant="secondary">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </motion.div>
    );
  }

  const category = subscription.category;
  const benefits = buildBenefits(subscription);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pb-6 pt-6"
    >
      <Link
        href="/marketplace"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
            {category ? (
              <CategoryIcon iconName={category.icon ?? "Circle"} className="h-7 w-7 text-primary" />
            ) : (
              <CircleDollarSign className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{subscription.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {category && (
                <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs font-normal">
                  <CategoryIcon iconName={category.icon ?? "Circle"} className="h-3 w-3" />
                  {category.name}
                </Badge>
              )}
              {subscription.company && (
                <Badge variant="outline" className="text-xs font-normal">
                  {subscription.company.name}
                </Badge>
              )}
              {subscription.isOwned && <Badge className="text-xs font-normal">Active</Badge>}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm">{subscription.description}</p>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardContent className="flex flex-row items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-bold text-primary">{formatPlanPrice(subscription)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Renewal</p>
              <p className="font-medium">{formatRenewal(subscription)}</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.14 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-auto">
              <ul className="space-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.section>

      {notice && (
        <p className="mb-3 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <motion.section initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}>
        <Button className="w-full" size="lg" disabled={subscription.isOwned || activating} onClick={() => void onActivate()}>
          {activating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : subscription.isOwned ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {subscription.isOwned ? "Activated" : activating ? "Activating..." : "Activate"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Payment provider integration is prepared for a future step.
        </p>
      </motion.section>
    </motion.div>
  );
}
