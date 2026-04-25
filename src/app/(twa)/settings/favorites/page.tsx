"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  type ApiCategory,
  getFavoriteCategorySlugs,
  getRegisteredCategories,
  saveFavoriteCategorySlugs,
} from "@/lib/api/categories-client";

export default function FavoriteCategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingMode = searchParams.get("onboarding") === "1";
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

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  const canSave = useMemo(() => selectedCount > 0 && !saving, [selectedCount, saving]);

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await saveFavoriteCategorySlugs(selected);
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Pick categories to personalize sliders, recommendations and category priority.
      </p>

      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Available categories</CardTitle>
          <CardDescription>{selectedCount} selected</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => {
            const active = selected.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => toggle(category.slug)}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/15"
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

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

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
