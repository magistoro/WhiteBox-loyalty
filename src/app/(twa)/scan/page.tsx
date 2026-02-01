"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function ScanPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-full flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", bounce: 0.3 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/20"
      >
        <QrCode className="h-12 w-12 text-primary" />
      </motion.div>
      <h1 className="mb-2 text-xl font-semibold">Scan / QR</h1>
      <p className="mb-8 max-w-[280px] text-center text-sm text-muted-foreground">
        Scan a merchant QR code to earn or spend points. Coming soon.
      </p>
      <Card className="glass w-full max-w-sm border-white/10">
        <CardContent className="p-6">
          <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-muted/50">
            <span className="text-xs text-muted-foreground">
              QR placeholder
            </span>
          </div>
          <Button className="w-full" variant="secondary" disabled>
            Open scanner
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
