"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Gift,
  Lock,
  MapPin,
  Medal,
  Route,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const seasonProgress = 42;
const currentTier = 7;
const maxTier = 20;

const tiers = [
  { level: 1, label: "Launch spark", reward: "Founding badge", icon: Sparkles, state: "claimed" },
  { level: 2, label: "Coffee pulse", reward: "+150 Aurora pts", icon: WalletCards, state: "claimed" },
  { level: 3, label: "Map scout", reward: "Route frame", icon: MapPin, state: "claimed" },
  { level: 4, label: "Category glow", reward: "Profile accent", icon: Star, state: "claimed" },
  { level: 5, label: "Weekly chest", reward: "Mystery perk", icon: Gift, state: "claimed" },
  { level: 6, label: "Partner step", reward: "+250 partner pts", icon: Medal, state: "claimed" },
  { level: 7, label: "Current tier", reward: "Pulse upgrade", icon: Flame, state: "current" },
  { level: 8, label: "Subscriber", reward: "3 bonus days", icon: Ticket, state: "next" },
  { level: 9, label: "Explorer", reward: "Map badge", icon: Route, state: "locked" },
  { level: 10, label: "Silver drop", reward: "Silver profile aura", icon: Trophy, state: "locked" },
];

const missions = [
  { title: "Earn 300 points", detail: "Any partner this week", progress: 220, total: 300, icon: Zap, accent: "text-cyan-200" },
  { title: "Build one route", detail: "Open Yandex route to a partner", progress: 0, total: 1, icon: Route, accent: "text-emerald-200" },
  { title: "Activate a subscription", detail: "Any marketplace plan", progress: 0, total: 1, icon: Ticket, accent: "text-amber-200" },
];

const rewards = [
  { title: "Profile aura", subtitle: "Cosmetic glow", icon: Crown },
  { title: "Bonus points", subtitle: "Company-specific", icon: WalletCards },
  { title: "Mystery perk", subtitle: "Weekly reveal", icon: Gift },
];

export default function SeasonPassPrototypePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full overflow-hidden px-4 pb-24 pt-5"
    >
      <Link href="/settings" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <section className="relative mb-4 overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950 p-5 shadow-[0_26px_80px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(34,211,238,0.22),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <Badge variant="secondary" className="mb-3 gap-1 border-white/10 bg-white/10 text-white">
                <CalendarDays className="h-3 w-3" />
                May season prototype
              </Badge>
              <h1 className="max-w-[14rem] text-3xl font-semibold leading-none tracking-tight">
                Loyalty Season
              </h1>
              <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-white/60">
                Complete simple loyalty missions, unlock cosmetic badges and company-specific bonuses.
              </p>
            </div>

            <motion.div
              animate={{ rotate: [0, 8, -8, 0], y: [0, -3, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-white/15 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_42px_rgba(0,0,0,0.35)]"
            >
              <Crown className="h-8 w-8 drop-shadow-[0_0_14px_rgba(255,255,255,0.65)]" />
            </motion.div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-white/45">Current tier</p>
                <p className="text-lg font-semibold">{currentTier} / {maxTier}</p>
              </div>
              <Badge className="gap-1 bg-white text-black">
                <Flame className="h-3 w-3" />
                {seasonProgress}% complete
              </Badge>
            </div>
            <Progress value={seasonProgress} className="h-2 bg-white/10 [&>div]:bg-white" />
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Reward track</h2>
            <p className="text-xs text-muted-foreground">Swipe through tiers and preview what unlocks next.</p>
          </div>
          <Badge variant="outline" className="border-white/10">demo only</Badge>
        </div>

        <div className="hide-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 touch-pan-x">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isClaimed = tier.state === "claimed";
            const isCurrent = tier.state === "current";
            const isNext = tier.state === "next";
            return (
              <motion.div
                key={tier.level}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative min-w-[8.6rem] snap-start overflow-hidden rounded-3xl border p-3",
                  isCurrent
                    ? "border-cyan-200/40 bg-cyan-300/10 shadow-[0_0_38px_rgba(103,232,249,0.14)]"
                    : isClaimed
                      ? "border-emerald-300/25 bg-emerald-500/8"
                      : isNext
                        ? "border-white/18 bg-white/[0.07]"
                        : "border-white/10 bg-white/[0.025] opacity-70",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tier {tier.level}</span>
                  {isClaimed ? <Check className="h-4 w-4 text-emerald-200" /> : tier.state === "locked" ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Sparkles className="h-4 w-4 text-cyan-100" />}
                </div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                  <Icon className={cn("h-6 w-6", isClaimed ? "text-emerald-100" : isCurrent ? "text-cyan-100" : "text-white/70")} />
                </div>
                <p className="text-sm font-semibold leading-tight">{tier.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{tier.reward}</p>
                {isCurrent && <div className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent" />}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mb-4 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Weekly missions</h2>
            <p className="text-xs text-muted-foreground">Earn season XP through normal product actions.</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            +920 XP left
          </Badge>
        </div>

        {missions.map((mission, index) => {
          const Icon = mission.icon;
          const progress = Math.min(100, Math.round((mission.progress / mission.total) * 100));
          return (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="glass overflow-hidden border-white/10 bg-slate-950/55">
                <CardContent className="p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      <Icon className={cn("h-5 w-5", mission.accent)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{mission.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{mission.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">{mission.progress}/{mission.total}</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-white/10" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="mb-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">What can rewards be?</h2>
            <p className="text-xs text-muted-foreground">A non-backend mock of possible value types.</p>
          </div>
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            return (
              <div key={reward.title} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
                <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-xs font-semibold leading-tight">{reward.title}</p>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{reward.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-primary text-primary-foreground p-4">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Premium track idea</p>
            <p className="mt-1 text-xs opacity-70">Could be sponsored by partners, not paid by users at MVP stage.</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 rounded-full" disabled>
            Preview
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
        Prototype page: static UI only, no database, no API, safe to delete.
      </div>
    </motion.div>
  );
}
