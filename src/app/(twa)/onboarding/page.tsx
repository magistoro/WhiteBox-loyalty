"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BadgePercent, Heart, MapPin, QrCode, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeTwaOnboarding, skipTwaOnboarding } from "@/lib/api/twa-client";

const steps = [
  {
    key: "favorites",
    icon: Heart,
    title: "Choose what you actually like",
    text: "Favorite categories tune marketplace sliders, partner suggestions and subscription discovery.",
    accent: "from-white/[0.12] via-zinc-500/[0.08] to-sky-400/[0.06]",
  },
  {
    key: "geo",
    icon: MapPin,
    title: "Let the map work for you",
    text: "Geolocation helps show nearby partners and build routes. You can deny it and still use the app.",
    accent: "from-emerald-400/[0.16] via-zinc-500/[0.07] to-cyan-400/[0.08]",
  },
  {
    key: "qr",
    icon: QrCode,
    title: "Your QR is the loyalty key",
    text: "Show it at partner locations so points are credited to your WhiteBox profile.",
    accent: "from-zinc-100/[0.16] via-zinc-500/[0.07] to-zinc-400/[0.08]",
  },
  {
    key: "value",
    icon: BadgePercent,
    title: "Points and subscriptions live together",
    text: "Earn points, unlock company levels, activate subscriptions and find benefits on the map.",
    accent: "from-sky-400/[0.16] via-zinc-500/[0.07] to-indigo-500/[0.08]",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [geoStatus, setGeoStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [busy, setBusy] = useState(false);
  const step = steps[index];
  const Icon = step.icon;
  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index]);

  async function finish() {
    setBusy(true);
    await completeTwaOnboarding();
    router.replace("/");
  }

  async function skip() {
    setBusy(true);
    await skipTwaOnboarding();
    router.replace("/");
  }

  function requestGeo() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGeoStatus("granted"),
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <main className="min-h-full overflow-hidden px-4 pb-6 pt-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mx-auto max-w-lg"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> First launch
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome to WhiteBox</h1>
            <p className="mt-1 text-sm text-muted-foreground">Four quick hints, then the app is yours.</p>
          </div>
          <button
            type="button"
            onClick={skip}
            disabled={busy}
            className="rounded-full border border-white/10 bg-muted/10 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/20"
          >
            Skip
          </button>
        </div>

        <Card className="glass relative overflow-hidden border-white/10 bg-[#111318]">
          <div className={`absolute inset-0 bg-gradient-to-br ${step.accent}`} aria-hidden />
          <CardContent className="relative space-y-5 p-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>

            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="min-h-[300px] space-y-5"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-black/25 shadow-2xl">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold leading-tight">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>

              {step.key === "favorites" && (
                <Link
                  href="/settings/favorites?onboarding=1&next=/onboarding"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white text-black px-4 py-3 text-sm font-semibold transition hover:bg-white/90"
                >
                  Select favorite categories <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {step.key === "geo" && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <Button type="button" className="w-full" onClick={requestGeo}>
                    <MapPin className="mr-2 h-4 w-4" /> Allow geolocation
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {geoStatus === "idle" && "Optional, but makes the map much smarter."}
                    {geoStatus === "granted" && "Perfect. Nearby partners will be easier to find."}
                    {geoStatus === "denied" && "No problem. You can enable it later in browser settings."}
                    {geoStatus === "unsupported" && "This browser does not expose geolocation."}
                  </p>
                </div>
              )}

              {step.key === "qr" && (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)]">
                  <QrCode className="h-14 w-14" />
                </div>
              )}

              {step.key === "value" && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    [WalletCards, "Loyalty cards"],
                    [BadgePercent, "Subscriptions"],
                    [MapPin, "Map routes"],
                    [Sparkles, "Levels"],
                  ].map(([ItemIcon, label]) => (
                    <div key={label as string} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <ItemIcon className="mb-2 h-5 w-5 text-primary" />
                      <p className="text-sm font-semibold">{label as string}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="glass border-white/10"
                disabled={busy || index === 0}
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={busy}
                onClick={() => (index === steps.length - 1 ? void finish() : setIndex((value) => value + 1))}
              >
                {index === steps.length - 1 ? "Start using WhiteBox" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
}
