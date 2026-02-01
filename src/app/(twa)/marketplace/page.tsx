"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  subscriptions,
  categories,
  getSubscriptionsForMarketplace,
  getCategoryById,
} from "@/lib/mockData";
import type { CategoryId } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const filteredSubscriptions = useMemo(
    () => getSubscriptionsForMarketplace(selectedCategory),
    [selectedCategory]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-4"
    >
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-semibold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Activate plans and use benefits at partner locations
        </p>
      </div>

      {/* Category filter */}
      <ScrollArea className="w-full whitespace-nowrap mb-6">
        <div className="flex gap-2 pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "glass border border-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "glass border border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </ScrollArea>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredSubscriptions.map((sub) => {
          const category = sub.categoryId ? getCategoryById(sub.categoryId) : null;
          return (
            <motion.li key={sub.id} variants={item}>
              <Link href={`/marketplace/${sub.id}`}>
                <Card className="glass border-white/10 transition-all active:scale-[0.98] hover:border-white/20">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{sub.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {sub.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-primary">
                          {sub.priceLabel}
                        </span>
                        {category && (
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="shrink-0">
                      View
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>

      {filteredSubscriptions.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No subscriptions in this category.
        </p>
      )}
    </motion.div>
  );
}
