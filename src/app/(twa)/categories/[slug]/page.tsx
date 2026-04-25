"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { categories as mockCategories, subscriptions } from "@/lib/mockData";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const category = useMemo(
    () => mockCategories.find((c) => c.slug === slug),
    [slug],
  );

  const offers = useMemo(
    () => subscriptions.filter((s) => s.categoryId === slug).slice(0, 8),
    [slug],
  );

  return (
    <div className="min-h-full px-4 pb-4 pt-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <CategoryIcon iconName={category?.icon ?? "Circle"} className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">{category?.name ?? titleFromSlug(slug)}</h1>
      </div>
      <p className="text-muted-foreground mb-4 text-sm">
        Best offers in this category.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(offers.length > 0
          ? offers
          : Array.from({ length: 4 }).map((_, idx) => ({
              id: `placeholder-${idx}`,
              name: `${titleFromSlug(slug)} Offer`,
              description: "Offer placeholder. New category offers will appear here.",
              priceLabel: "from 99 pts",
            }))).map((offer, idx) => (
          <Card key={offer.id} className="glass overflow-hidden border-white/10">
            <div className="h-28 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted/30 p-3">
              <div className="flex h-full items-end">
                <span className="rounded-full bg-background/70 px-2 py-1 text-xs">
                  Top #{idx + 1}
                </span>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-semibold">{offer.name}</p>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{offer.description}</p>
              <p className="mt-2 text-sm font-medium text-primary">{offer.priceLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
