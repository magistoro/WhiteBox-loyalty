"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ChevronDown,
  Heart,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { getStoredUser, type StoredUser } from "@/lib/api/auth-client";
import { getFavoriteCategorySlugs, getRegisteredCategories } from "@/lib/api/categories-client";
import { getTotalBalance } from "@/lib/mockData";

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

export default function SettingsPage() {
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategoryChip[]>([]);

  useEffect(() => {
    setUser(getStoredUser());
    void (async () => {
      const [allCategories, favoriteSlugs] = await Promise.all([
        getRegisteredCategories(),
        getFavoriteCategorySlugs(),
      ]);
      const favoriteSet = new Set(favoriteSlugs);
      setFavoriteCategories(
        allCategories
          .filter((c) => favoriteSet.has(c.slug))
          .map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
      );
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

  const profileScore = getTotalBalance() % 1000;
  const favoriteSummary = useMemo(
    () => (favoriteCategories.length === 0 ? "No favorites yet" : `${favoriteCategories.length} categories selected`),
    [favoriteCategories.length],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pb-4 pt-6"
    >
      <header
        id="section-profile-header"
        className="mb-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center"
      >
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-2xl font-bold text-primary ring-2 ring-primary/30"
          aria-hidden
        >
          {user?.name ? initials(user.name) : "?"}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">{user?.name ?? "Guest"}</p>
        </div>
      </header>

      <div className="grid gap-3">
        <Card className="glass border-white/10">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-muted-foreground text-xs">Your score</p>
              <p className="text-2xl font-bold tracking-tight tabular-nums">{profileScore}</p>
            </div>
            <div className="flex h-10 items-center rounded-full bg-primary/15 px-3">
              <Star className="mr-1.5 h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Silver level</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/settings/account" id="settings-block">
          <Card className="glass border-white/10 transition-colors hover:bg-muted/10">
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-base">Account settings</CardTitle>
                <CardDescription>Personal data and account controls</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                Open account preferences page
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Favorite categories</CardTitle>
            <CardDescription>{favoriteSummary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {favoriteCategories.length === 0 ? (
                <span className="rounded-full border border-dashed border-white/20 px-3 py-1 text-xs text-muted-foreground">
                  Choose categories to personalize your feed
                </span>
              ) : (
                favoriteCategories.slice(0, 6).map((cat) => (
                  <span
                    key={cat.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-muted/10 px-3 py-1 text-xs"
                  >
                    <CategoryIcon iconName={cat.icon} className="h-3.5 w-3.5 text-primary" />
                    {cat.name}
                  </span>
                ))
              )}
            </div>
            <Link
              href="/settings/favorites"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-muted/10 px-3 py-2 text-sm transition-colors hover:bg-muted/20"
            >
              <Heart className="h-4 w-4 text-primary" />
              Select favorite categories
            </Link>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">More</CardTitle>
            <CardDescription>Reviews, partnership and business tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/settings/reviews" className="flex items-center justify-between rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">My reviews</p>
                  <p className="text-muted-foreground text-xs">See and manage your feedback</p>
                </div>
              </div>
              <ChevronDown className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/settings/partnership" className="flex items-center justify-between rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Partnership</p>
                  <p className="text-muted-foreground text-xs">Collaborate with WhiteBox partners</p>
                </div>
              </div>
              <ChevronDown className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/settings/business" className="flex items-center justify-between rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">For business</p>
                  <p className="text-muted-foreground text-xs">Grow with loyalty programs for brands</p>
                </div>
              </div>
              <ChevronDown className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Link href="/companies" className="rounded-xl border border-white/10 bg-muted/10 px-3 py-3 transition-colors hover:bg-muted/20">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Explore partners</p>
              <p className="text-muted-foreground text-xs">Find new stores and loyalty deals</p>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
