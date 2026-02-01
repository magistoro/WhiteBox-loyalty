"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full px-4 pt-6 pb-4"
    >
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>
      <Card className="glass border-white/10">
        <CardHeader>
          <h2 className="text-sm font-medium text-muted-foreground">
            Account & preferences
          </h2>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Settings and notifications will be available in a future update.
        </CardContent>
      </Card>
    </motion.div>
  );
}
