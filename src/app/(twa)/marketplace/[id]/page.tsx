"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  getSubscriptionById,
  getCategoryById,
  getCompanyById,
} from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Coffee, Check } from "lucide-react";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const subscription = getSubscriptionById(id);

  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-full flex-col items-center justify-center px-6"
      >
        <p className="mb-4 text-muted-foreground">Subscription not found.</p>
        <Link href="/marketplace">
          <Button variant="secondary">Back to Marketplace</Button>
        </Link>
      </motion.div>
    );
  }

  const category = subscription.categoryId
    ? getCategoryById(subscription.categoryId)
    : null;
  const partner = subscription.companyId
    ? getCompanyById(subscription.companyId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-6"
    >
      <Link
        href="/marketplace"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
            <Coffee className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{subscription.name}</h1>
            {category && (
              <Badge variant="secondary" className="mt-1 text-xs font-normal">
                {category.name}
              </Badge>
            )}
            {partner && (
              <p className="text-sm text-muted-foreground mt-1">{partner.name}</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Description & conditions */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm">{subscription.description}</p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Price & renewal */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-xl font-bold text-primary">{subscription.priceLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Renewal</p>
              <p className="font-medium">{subscription.renewalLabel}</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.14 }}
        className="mb-6"
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-auto">
              <ul className="space-y-2">
                {subscription.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.section>

      {/* Activate CTA */}
      <motion.section
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
      >
        <Button className="w-full" size="lg">
          Activate
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Subscription will be charged at renewal. Cancel anytime.
        </p>
      </motion.section>
    </motion.div>
  );
}
