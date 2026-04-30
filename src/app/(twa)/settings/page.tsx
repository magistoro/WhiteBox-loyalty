"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgePercent,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  Heart,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Ticket,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getStoredUser, type StoredUser } from "@/lib/api/auth-client";
import { getFavoriteCategorySlugs, getRegisteredCategories } from "@/lib/api/categories-client";
import {
  getTwaDashboard,
  getTwaProfile,
  redeemTwaPromoCode,
  redeemTwaReferralCode,
  type TwaProfile,
} from "@/lib/api/twa-client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

type FavoriteCategoryChip = {
  slug: string;
  name: string;
  icon: string;
};

const fallbackProfile: TwaProfile = {
  user: { uuid: "", name: "", email: "", createdAt: "" },
  preferences: {
    onboardingCompletedAt: null,
    onboardingSkippedAt: null,
    geolocationPromptedAt: null,
    profileVisibility: "PRIVATE",
    marketingOptIn: false,
    showActivityStats: true,
  },
  stats: {
    totalBalance: 0,
    partnerCount: 0,
    activeSubscriptions: 0,
    favoriteCategories: 0,
    activityScore: 0,
  },
  favoriteCategories: [],
  referral: {
    code: "",
    title: "Invite a friend",
    inviterBonusPoints: 0,
    invitedBonusPoints: 0,
    isActive: false,
  },
};

export default function SettingsPage() {
  const pathname = usePathname();
  const [user] = useState<StoredUser | null>(() => getStoredUser());
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategoryChip[]>([]);
  const [profile, setProfile] = useState<TwaProfile>(fallbackProfile);
  const [promoCode, setPromoCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const [allCategories, favoriteSlugs, dashboard, freshProfile] = await Promise.all([
        getRegisteredCategories(),
        getFavoriteCategorySlugs(),
        getTwaDashboard(),
        getTwaProfile(),
      ]);
      const favoriteSet = new Set(favoriteSlugs);
      const favoriteList = allCategories
        .filter((c) => favoriteSet.has(c.slug))
        .map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }));
      setFavoriteCategories(favoriteList);
      setProfile({
        ...freshProfile,
        stats: {
          ...freshProfile.stats,
          totalBalance: freshProfile.stats.totalBalance || dashboard.wallet.totalBalance,
          partnerCount: freshProfile.stats.partnerCount || dashboard.wallet.companies.length,
          activeSubscriptions: freshProfile.stats.activeSubscriptions || dashboard.activeSubscriptions.length,
          favoriteCategories: freshProfile.stats.favoriteCategories || favoriteList.length,
          activityScore: freshProfile.stats.activityScore || Math.min(100, Math.round((dashboard.wallet.totalBalance / 5000) * 55 + dashboard.wallet.companies.length * 8 + dashboard.activeSubscriptions.length * 12)),
        },
      });
    })();
  }, []);

  useEffect(() => {
    function scrollToHash() {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const id = decodeURIComponent(raw);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  const favoriteSummary = useMemo(
    () => (favoriteCategories.length === 0 ? "No favorites yet" : `${favoriteCategories.length} categories selected`),
    [favoriteCategories.length],
  );

  const activityLabel = profile.stats.activityScore >= 75 ? "Gold rhythm" : profile.stats.activityScore >= 40 ? "Silver rhythm" : "Starter rhythm";

  async function redeemPromo() {
    if (!promoCode.trim()) return;
    setBusy(true);
    setMessage(null);
    const res = await redeemTwaPromoCode(promoCode);
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message);
      return;
    }
    setPromoCode("");
    setMessage(res.data.message);
    setProfile(await getTwaProfile());
  }

  async function redeemReferral() {
    if (!referralCode.trim()) return;
    setBusy(true);
    setMessage(null);
    const res = await redeemTwaReferralCode(referralCode);
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message);
      return;
    }
    setReferralCode("");
    setMessage(res.data.message);
    setProfile(await getTwaProfile());
  }

  async function copyReferralCode() {
    if (!profile.referral.code) return;
    await navigator.clipboard?.writeText(profile.referral.code).catch(() => undefined);
    setMessage("Referral code copied.");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pb-4 pt-6"
    >
      <header id="section-profile-header" className="mb-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary/20 text-2xl font-bold text-primary ring-2 ring-primary/30" aria-hidden>
          {user?.name ? initials(user.name) : "?"}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{user?.name ?? profile.user.name ?? "Guest"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/15 text-primary"><Star className="h-3 w-3" /> {activityLabel}</Badge>
            <Badge variant="secondary"><WalletCards className="h-3 w-3" /> {profile.stats.totalBalance} pts</Badge>
          </div>
        </div>
      </header>

      {message && <div className="mb-3 rounded-2xl border border-white/10 bg-muted/10 px-4 py-3 text-sm">{message}</div>}

      <div className="grid gap-3">
        <Card className="glass overflow-hidden border-white/10">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Activity level</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{profile.stats.activityScore}</p>
              </div>
              <div className="flex h-12 items-center rounded-2xl bg-primary/15 px-3 text-primary">
                <Sparkles className="mr-1.5 h-5 w-5" />
                <span className="text-sm font-semibold">{activityLabel}</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, profile.stats.activityScore)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-black/20 p-3"><p className="text-lg font-bold">{profile.stats.partnerCount}</p><p className="text-[11px] text-muted-foreground">partners</p></div>
              <div className="rounded-2xl bg-black/20 p-3"><p className="text-lg font-bold">{profile.stats.activeSubscriptions}</p><p className="text-[11px] text-muted-foreground">subs</p></div>
              <div className="rounded-2xl bg-black/20 p-3"><p className="text-lg font-bold">{profile.stats.favoriteCategories}</p><p className="text-[11px] text-muted-foreground">favorites</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Favorite categories</CardTitle>
            <CardDescription>{favoriteSummary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {favoriteCategories.length === 0 ? (
                <span className="rounded-full border border-dashed border-white/20 px-3 py-1 text-xs text-muted-foreground">Choose categories to personalize your feed</span>
              ) : (
                favoriteCategories.slice(0, 8).map((cat) => (
                  <span
                    key={cat.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white px-3 py-1 text-xs font-semibold text-black shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                  >
                    <CategoryIcon iconName={cat.icon} className="h-3.5 w-3.5 text-black" />
                    {cat.name}
                  </span>
                ))
              )}
            </div>
            <Link href="/settings/favorites" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-muted/10 px-3 py-2 text-sm transition-colors hover:bg-muted/20">
              <Heart className="h-4 w-4 text-primary" /> Select favorite categories
            </Link>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Ticket className="h-4 w-4 text-primary" /> Promo codes</CardTitle>
            <CardDescription>Activate bonus points or subscription access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input className="glass border-white/10 uppercase" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="PROMO CODE" />
              <Button type="button" disabled={busy || !promoCode.trim()} onClick={redeemPromo}>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><UsersRound className="h-4 w-4 text-primary" /> Invite friends</CardTitle>
            <CardDescription>
              {profile.referral.isActive
                ? `Both sides can receive bonuses: ${profile.referral.inviterBonusPoints}/${profile.referral.invitedBonusPoints} pts.`
                : "Referral campaign is paused right now."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button type="button" onClick={copyReferralCode} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-muted/10 px-3 py-3 text-left">
              <div><p className="text-xs text-muted-foreground">Your referral code</p><p className="font-semibold tracking-[0.18em]">{profile.referral.code || "..."}</p></div>
              <Copy className="h-4 w-4 text-primary" />
            </button>
            <div className="flex gap-2">
              <Input className="glass border-white/10 uppercase" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="FRIEND CODE" />
              <Button type="button" variant="secondary" className="glass border-white/10" disabled={busy || !referralCode.trim()} onClick={redeemReferral}>Redeem</Button>
            </div>
          </CardContent>
        </Card>

        <Link href="/settings/account" id="settings-block">
          <Card className="glass border-white/10 transition-colors hover:bg-muted/10">
            <CardHeader className="pb-2"><CardTitle className="text-base">Account settings</CardTitle><CardDescription>Personal data and account controls</CardDescription></CardHeader>
            <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground"><Settings className="h-4 w-4" /> Open account preferences page</div></CardContent>
          </Card>
        </Link>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">More</CardTitle><CardDescription>Reviews, partnership and business tools</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {[
              ["/settings/reviews", MessageSquareText, "My reviews", "See and manage your feedback"],
              ["/settings/partnership", ShieldCheck, "Partnership", "Collaborate with WhiteBox partners"],
              ["/settings/business", BriefcaseBusiness, "For business", "Grow with loyalty programs for brands"],
            ].map(([href, Icon, title, description]) => (
              <Link key={href as string} href={href as string} className="flex items-center justify-between rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <div><p className="text-sm font-medium">{title as string}</p><p className="text-xs text-muted-foreground">{description as string}</p></div>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Link href="/companies" className="rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
          <div className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Explore partners</p><p className="text-xs text-muted-foreground">Find new stores and loyalty deals</p></div></div>
        </Link>
      </div>
    </motion.div>
  );
}
