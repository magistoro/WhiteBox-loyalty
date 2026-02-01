"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  getCompanyById,
  getSubscriptionsByCompany,
  getCategoryById,
  isExpiringSoon,
} from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, QrCode, AlertCircle, Coffee, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const params = useParams();
  const id = params.id as string;
  const company = getCompanyById(id);

  if (!company) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-full flex-col items-center justify-center px-6"
      >
        <p className="mb-4 text-muted-foreground">Company not found.</p>
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </motion.div>
    );
  }

  const progress =
    (company.pointsPerReward - company.pointsToNextReward) /
    company.pointsPerReward;
  const progressPercent = Math.min(100, Math.max(0, progress * 100));
  const showExpiring =
    company.expiringPoints != null &&
    company.expiringPoints > 0 &&
    company.expiringDate &&
    isExpiringSoon(company.expiringDate);
  const partnerSubscriptions = getSubscriptionsByCompany(company.id);
  const category = getCategoryById(company.categoryId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-4 pb-6"
    >
      {/* Back */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Big balance */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm text-muted-foreground">{company.name}</p>
          {category && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {category.name}
            </Badge>
          )}
        </div>
        <p className="text-4xl font-bold tracking-tight tabular-nums text-primary">
          {company.balance}
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            pts
          </span>
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next reward</span>
            <span>{company.pointsToNextReward} pts left</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </motion.section>

      {/* Your QR Code (placeholder) */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Your QR Code</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              Show this to the cashier to earn or spend points.
            </p>
            <div className="flex aspect-square max-w-[200px] items-center justify-center rounded-xl bg-muted/50 border border-white/10 mx-auto">
              <span className="text-xs text-muted-foreground">
                QR placeholder
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Partner subscriptions */}
      {partnerSubscriptions.length > 0 && (
        <motion.section
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <Card className="glass border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Subscriptions at this partner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {partnerSubscriptions.map((sub) => (
                <Link key={sub.id} href={`/marketplace/${sub.id}`}>
                  <Card className="glass border-white/10 transition-all hover:border-white/20">
                    <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.priceLabel}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Expiring soon */}
      {showExpiring && (
        <motion.section
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            className={cn(
              "glass border-amber-500/30 bg-amber-500/5"
            )}
          >
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-200">
                Expiring soon
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-amber-200">
                  {company.expiringPoints} pts
                </span>{" "}
                expire on{" "}
                {company.expiringDate
                  ? new Date(company.expiringDate).toLocaleDateString()
                  : ""}
                . Use them before they’re gone.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </motion.div>
  );
}
