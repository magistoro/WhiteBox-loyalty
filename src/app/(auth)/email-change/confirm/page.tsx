"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { confirmEmailChangeToken } from "@/lib/api/auth-client";

export default function ConfirmEmailChangePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Confirming email change..." : "Missing email change token.");

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const res = await confirmEmailChangeToken(token);
      if (res.ok) {
        setState("success");
        setMessage(`Email updated to ${res.data.email}. You can now log in with the new email.`);
      } else {
        setState("error");
        setMessage(res.message);
      }
    })();
  }, [token]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl">Email Change Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={state === "error" ? "text-destructive" : state === "success" ? "text-emerald-300" : "text-muted-foreground"}>
            {message}
          </p>
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
