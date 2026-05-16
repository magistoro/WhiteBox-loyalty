"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STALE_AFTER_MS = 10 * 60 * 1000;

export function TwaStaleDataNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), STALE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="pointer-events-none fixed inset-x-4 bottom-24 z-40 mx-auto max-w-[34rem]"
        >
          <div className="pointer-events-auto glass rounded-3xl border border-white/10 bg-background/85 p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Refresh your wallet?</p>
                <p className="text-xs text-muted-foreground">You have been here a while. A quick refresh will sync balances and subscriptions.</p>
              </div>
              <Button size="sm" className="h-9 shrink-0" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <button
                type="button"
                aria-label="Dismiss refresh reminder"
                onClick={() => setVisible(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
