"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const message = token
    ? "Email change confirmation is not active yet."
    : "Email change confirmation is not active yet. Missing token.";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl">Email Change Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={(
      <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-xl glass border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Email Change Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Email confirmation is not active yet.</p>
          </CardContent>
        </Card>
      </div>
    )}>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
