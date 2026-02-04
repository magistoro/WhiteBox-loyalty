"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  categories,
  getTotalBalance,
  getCompaniesBySearch,
  getSubscriptionById,
  getCategoryById,
} from "@/lib/mockData";
import { getActiveSubscriptions } from "@/services/subscriptions/subscription.service";
import { computeSubscriptionProgress } from "@/services/subscriptions/subscription.progress";
import { SubscriptionProgressBar } from "@/components/subscriptions/SubscriptionProgressBar";
import type { CategoryId } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ChevronRight, Search, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const HOME_LOYALTY_CARDS_PREVIEW_LIMIT = 4;

export default function HomePage() {
  const totalBalance = getTotalBalance();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const filteredCompanies = useMemo(
    () => getCompaniesBySearch(searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  const displayedCompanies = useMemo(
    () => filteredCompanies.slice(0, HOME_LOYALTY_CARDS_PREVIEW_LIMIT),
    [filteredCompanies]
  );

  const activeSubsWithDetails = useMemo(
    () =>
      getActiveSubscriptions()
        .map((a) => ({ ...a, sub: getSubscriptionById(a.subscriptionId) }))
        .filter((a): a is typeof a & { sub: NonNullable<typeof a.sub> } => !!a.sub),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-4"
    >
      {/* Search bar */}
      <motion.section
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass border-white/10 pl-9 h-10 rounded-xl"
          />
        </div>
      </motion.section>

      {/* Category selector — horizontal scroll; only filters company cards */}
      <motion.section
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mb-4"
      >
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat.id ? null : cat.id))
                }
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "glass border border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </motion.section>


      {/* Total Balance */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <motion.div variants={item} className="mb-1 text-sm text-muted-foreground">
          Total Balance
        </motion.div>
        <motion.div
          variants={item}
          className="glass flex items-center gap-3 rounded-2xl border border-white/10 p-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {totalBalance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">points across all shops</p>
          </div>
        </motion.div>
      </motion.section>

      {/* Active Subscriptions */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Active Subscriptions
          </h2>
          <div className="flex items-center gap-1">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-8">
                History
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="text-primary text-xs h-8">
                All Subscriptions
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activeSubsWithDetails.slice(0, 3).map(({ sub, subscriptionId, expiresAt, renewPeriodDays }) =>
            sub ? (
              <Link key={subscriptionId} href={`/marketplace/${subscriptionId}`}>
                <Card className="glass min-w-[160px] border-white/10 transition-all active:scale-[0.98] hover:border-white/20">
                  <CardContent className="p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 mb-2">
                      <Coffee className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold truncate">{sub.name}</p>
                    <SubscriptionProgressBar
                      progress={computeSubscriptionProgress({ expiresAt, renewPeriodDays })}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              </Link>
            ) : null
          )}
        </div>
      </motion.section>

      {/* Loyalty Cards — preview only; category filter applies here only */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <motion.h2
            variants={item}
            className="text-sm font-semibold text-muted-foreground"
          >
            Loyalty Cards
          </motion.h2>
          <Link href="/companies">
            <Button variant="ghost" size="sm" className="text-primary text-xs h-8">
              View All
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </Link>
        </div>
        <motion.div
          variants={container}
          initial={false}
          animate="show"
          className="grid gap-3 sm:grid-cols-2"
        >
          {displayedCompanies.map((company) => {
            const progress =
              (company.pointsPerReward - company.pointsToNextReward) /
              company.pointsPerReward;
            const progressPercent = Math.min(100, Math.max(0, progress * 100));
            const category = getCategoryById(company.categoryId);

            return (
              <motion.div key={company.id} variants={item}>
                <Link href={`/wallet/${company.id}`}>
                  <Card
                    className={cn(
                      "glass cursor-pointer border-white/10 transition-all active:scale-[0.98] hover:border-white/20"
                    )}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 px-4 py-3 pb-1">
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {company.name}
                        </CardTitle>
                        {category && (
                          <Badge variant="secondary" className="mt-1 text-[10px] font-normal">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="mb-2 text-xl font-bold tabular-nums text-primary">
                        {company.balance}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          pts
                        </span>
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Next reward</span>
                          <span>{company.pointsToNextReward} pts left</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        {filteredCompanies.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No partners match your search.
          </p>
        )}
        {filteredCompanies.length > 0 && filteredCompanies.length > HOME_LOYALTY_CARDS_PREVIEW_LIMIT && (
          <div className="mt-3 text-center">
            <Link href="/companies">
              <Button variant="outline" size="sm" className="glass border-white/10">
                View all {filteredCompanies.length} partners
              </Button>
            </Link>
          </div>
        )}
      </section>
    </motion.div>
  );
}
