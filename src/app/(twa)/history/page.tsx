"use client";

import { motion } from "framer-motion";
import { transactions } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

export default function HistoryPage() {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-4"
    >
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-4"
      >
        <motion.div variants={item} className="mb-1 flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">History</h1>
        </motion.div>
        <motion.p variants={item} className="text-sm text-muted-foreground">
          Your earn and spend transactions
        </motion.p>
      </motion.section>

      <ScrollArea className="h-[calc(100dvh-11rem)] pr-2">
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {sorted.map((tx) => (
            <motion.li key={tx.id} variants={item}>
              <Card className="glass border-white/10">
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      tx.type === "earn"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    {tx.type === "earn" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{tx.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "tabular-nums font-semibold",
                        tx.type === "earn" ? "text-emerald-400" : "text-amber-400"
                      )}
                    >
                      {tx.type === "earn" ? "+" : "-"}
                      {Math.abs(tx.amount)}
                    </span>
                    <Badge
                      variant={tx.status === "active" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {tx.status === "active" ? "Active" : "Expired"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </ScrollArea>
    </motion.div>
  );
}
