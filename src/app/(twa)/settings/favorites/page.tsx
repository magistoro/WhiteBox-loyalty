"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  type ApiCategory,
  getFavoriteCategorySlugs,
  getRegisteredCategories,
  saveFavoriteCategorySlugs,
} from "@/lib/api/categories-client";

const MAX_FAVORITE_CATEGORIES = 10;

function FavoriteCategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingMode = searchParams.get("onboarding") === "1";
  const nextPath = searchParams.get("next") || "/";
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [all, favorites] = await Promise.all([
        getRegisteredCategories(),
        getFavoriteCategorySlugs(),
      ]);
      setCategories(all);
      setSelected(favorites);
    })();
  }, []);

  const selectedCount = selected.length;
  const title = onboardingMode ? "Select favorite categories" : "Favorite categories";
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(slug: string) {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_FAVORITE_CATEGORIES) return prev;
      return [...prev, slug];
    });
  }

  const canSave = useMemo(() => selectedCount > 0 && !saving, [selectedCount, saving]);

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await saveFavoriteCategorySlugs(selected);
    setSaving(false);
    if (!res.ok) {
      setError("Choose up to 10 categories.");
      return;
    }
    router.replace(nextPath);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Pick categories to personalize sliders, recommendations and category priority.
      </p>

      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Choose categories
              </CardTitle>
              <CardDescription className="mt-1">
                Pick what you want to see first.
              </CardDescription>
            </div>
            <div className="min-w-[84px] shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white px-3 py-1 text-center text-xs font-semibold text-black">
              selected {selectedCount}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => {
            const active = selectedSet.has(category.slug);
            const locked = !active && selectedCount >= MAX_FAVORITE_CATEGORIES;
            return (
              <button
                key={category.slug}
                type="button"
                aria-pressed={active}
                disabled={locked}
                onClick={() => toggle(category.slug)}
                className={`relative rounded-xl border px-3 py-3 text-left transition-colors ${
                  active
                    ? "border-white bg-white/[0.16] shadow-[0_0_0_1px_rgba(255,255,255,0.22)]"
                    : locked
                      ? "cursor-not-allowed border-white/5 bg-muted/5 opacity-35"
                    : "border-white/10 bg-muted/10 hover:bg-muted/20"
                }`}
              >
                <CategoryIcon iconName={category.icon} className="mb-2 h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{category.name}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {error && <p className="mt-2 text-sm text-muted-foreground">{error}</p>}

      <div className="mt-3 flex gap-2">
        <Button type="button" className="flex-1" disabled={!canSave} onClick={onSave}>
          <Heart className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save favorites"}
        </Button>
        {!onboardingMode && (
          <Button type="button" variant="secondary" className="glass border-white/10" onClick={() => router.replace("/settings")}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default function FavoriteCategoriesPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-muted-foreground">Loading favorite categories...</div>}>
      <FavoriteCategoriesContent />
    </Suspense>
  );
}
