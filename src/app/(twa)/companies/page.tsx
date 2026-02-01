"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  companies,
  categories,
  getCompaniesBySearch,
  getCategoryById,
} from "@/lib/mockData";
import type { CategoryId } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const filteredCompanies = useMemo(
    () => getCompaniesBySearch(searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-24"
    >
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-xl font-semibold mb-1">All Partners</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Browse and open loyalty cards
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass border-white/10 pl-9 h-10 rounded-xl"
        />
      </div>

      <div className="overflow-x-auto overflow-y-hidden mb-4 -mx-4 px-4">
        <div className="flex gap-2 pb-2 min-w-max">
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
              onClick={() => setSelectedCategory(cat.id)}
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

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredCompanies.map((company) => {
          const progress =
            (company.pointsPerReward - company.pointsToNextReward) /
            company.pointsPerReward;
          const progressPercent = Math.min(100, Math.max(0, progress * 100));
          const category = getCategoryById(company.categoryId);
          return (
            <motion.li key={company.id} variants={item}>
              <Link href={`/wallet/${company.id}`}>
                <Card className="glass cursor-pointer border-white/10 transition-all active:scale-[0.98] hover:border-white/20">
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
            </motion.li>
          );
        })}
      </motion.ul>

      {filteredCompanies.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No partners match your search.
        </p>
      )}
    </motion.div>
  );
}
