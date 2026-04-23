"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { clearStoredSession, getStoredUser, type StoredUser } from "@/lib/api/auth-client";
import { maskEmail } from "@/lib/email-mask";

export default function SettingsAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  const masked = user?.email ? maskEmail(user.email) : "—";

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Account settings</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Manage personal data, notifications, password and account status.
      </p>

      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personal data</CardTitle>
          <CardDescription>Core account fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
            <span className="text-muted-foreground text-xs">Name</span>
            <span className="text-sm font-medium">{user?.name ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
            <span className="text-muted-foreground text-xs">Email</span>
            <span className="text-sm font-medium">{masked}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass mt-3 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Preference toggles (client-side mock)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
            <p className="text-sm">Email</p>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} aria-label="Email notifications" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
            <p className="text-sm">Push</p>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} aria-label="Push notifications" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
            <p className="text-sm">Offers</p>
            <Switch checked={marketingNotif} onCheckedChange={setMarketingNotif} aria-label="Marketing notifications" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" className="glass border-white/10" onClick={() => setPasswordOpen(true)}>
          <Lock className="mr-2 h-4 w-4" />
          Change password
        </Button>
        <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
          Remove profile
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="glass border-white/10" asChild>
          <Link href="/help/privacy?section=settings-account" scroll={false}>
            <Shield className="mr-2 h-4 w-4" />
            Privacy policy
          </Link>
        </Button>
        <Button type="button" variant="secondary" size="sm" className="glass border-white/10" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
