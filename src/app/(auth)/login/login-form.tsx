"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FrozenAccountDialog } from "@/components/auth/FrozenAccountDialog";
import { login, setStoredSession } from "@/lib/api/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [frozenOpen, setFrozenOpen] = useState(false);
  const [pendingNext, setPendingNext] = useState("/");
  const [frozenMeta, setFrozenMeta] = useState<{ name: string; at: string | null } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (!("accessToken" in data) || !data.accessToken) {
        setError("message" in data ? data.message : "Login failed");
        return;
      }
      const next = searchParams.get("next");
      const safe =
        data.user.role === "ADMIN"
          ? "/admin"
          : data.user.role === "COMPANY"
            ? "/company"
            : next && next.startsWith("/") && !next.startsWith("//")
              ? next
              : "/";

      if (data.user.accountStatus === "FROZEN_PENDING_DELETION") {
        setStoredSession(data);
        setPendingNext(safe);
        setFrozenMeta({
          name: data.user.name,
          at: data.user.deletionScheduledAt ?? null,
        });
        setFrozenOpen(true);
        return;
      }

      setStoredSession(data);
      router.replace(safe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use your email and password. New users can create an account below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {searchParams.get("deleted") === "1" && (
            <p
              className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary"
              role="status"
            >
              Your account session was removed from this device. Sign in again to continue.
            </p>
          )}
          {searchParams.get("frozen") === "1" && (
            <p
              className="rounded-lg border border-sky-500/35 bg-sky-950/50 px-3 py-2 text-sm text-sky-200"
              role="status"
            >
              You scheduled this account for deletion. Sign in within 5 days to reactivate before
              all data is removed.
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="glass border-white/10"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </form>

      <FrozenAccountDialog
        open={frozenOpen}
        onOpenChange={setFrozenOpen}
        userName={frozenMeta?.name ?? ""}
        deletionScheduledAt={frozenMeta?.at ?? null}
        onClosed={() => router.replace(pendingNext)}
      />
    </Card>
  );
}
