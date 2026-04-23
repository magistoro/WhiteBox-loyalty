"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reactivateAccount, setStoredSession, type AuthTokensResponse } from "@/lib/api/auth-client";

function formatDeadline(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FrozenAccountDialog({
  open,
  onOpenChange,
  userName,
  deletionScheduledAt,
  onClosed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  deletionScheduledAt: string | null;
  /** Fired whenever the dialog closes (reactivate, dismiss, or backdrop). */
  onClosed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) onClosed();
  }

  async function handleReactivate() {
    setError(null);
    setBusy(true);
    try {
      const result = await reactivateAccount();
      if (!("accessToken" in result) || !result.accessToken) {
        setError("message" in result ? String(result.message) : "Could not reactivate.");
        return;
      }
      setStoredSession(result as AuthTokensResponse);
      handleOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showClose={false} className="glass max-w-md border-sky-500/40 bg-sky-950/30">
        <DialogHeader>
          <DialogTitle className="text-sky-200">Account scheduled for removal</DialogTitle>
          <DialogDescription className="text-sky-100/90">
            Hi {userName}, your profile is frozen. You have until{" "}
            <strong className="text-sky-100">{formatDeadline(deletionScheduledAt)}</strong> to
            reactivate — after that, your account and associated data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="w-full bg-sky-600 text-white hover:bg-sky-500"
            disabled={busy}
            onClick={handleReactivate}
          >
            {busy ? "Reactivating…" : "Reactivate my account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="glass w-full border-sky-400/30 text-sky-100 hover:bg-sky-950/50"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            I understand — continue to the app
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
