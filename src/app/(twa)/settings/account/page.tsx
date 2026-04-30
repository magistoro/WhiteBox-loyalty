"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, LogOut, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { clearStoredSession, getStoredUser, type StoredUser } from "@/lib/api/auth-client";
import { getTwaProfile, updateTwaProfilePreferences, type TwaProfile } from "@/lib/api/twa-client";
import { maskEmail } from "@/lib/email-mask";

type ProfilePreferences = TwaProfile["preferences"];

const fallbackPreferences: ProfilePreferences = {
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  geolocationPromptedAt: null,
  profileVisibility: "PRIVATE",
  marketingOptIn: false,
  showActivityStats: true,
};

export default function SettingsAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [preferences, setPreferences] = useState<ProfilePreferences>(fallbackPreferences);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    void (async () => {
      const profile = await getTwaProfile();
      setPreferences(profile.preferences);
    })();
  }, []);

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  async function updatePreference(input: Parameters<typeof updateTwaProfilePreferences>[0]) {
    setMessage(null);
    const res = await updateTwaProfilePreferences(input);
    if (!res.ok) {
      setMessage(res.message);
      return;
    }
    setPreferences(res.data);
  }

  const masked = user?.email ? maskEmail(user.email) : "-";

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Manage personal data, privacy, notifications, password and account status.
      </p>

      {message && <div className="mb-3 rounded-2xl border border-white/10 bg-muted/10 px-4 py-3 text-sm">{message}</div>}

      <Card className="glass border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personal data</CardTitle>
          <CardDescription>Core account fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{user?.name ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{masked}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass mt-3 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Privacy
          </CardTitle>
          <CardDescription>Profile visibility and activity preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["PRIVATE", "FRIENDS", "PUBLIC"] as const).map((visibility) => (
              <button
                key={visibility}
                type="button"
                onClick={() => void updatePreference({ profileVisibility: visibility })}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                  preferences.profileVisibility === visibility
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-white/10 bg-muted/10 text-muted-foreground"
                }`}
              >
                {visibility.toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-muted/10 px-3 py-3">
            <div>
              <p className="text-sm font-medium">Show activity stats</p>
              <p className="text-xs text-muted-foreground">Allow score and counters on profile surfaces.</p>
            </div>
            <Switch
              checked={preferences.showActivityStats}
              onCheckedChange={(checked) => void updatePreference({ showActivityStats: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-muted/10 px-3 py-3">
            <div>
              <p className="text-sm font-medium">Marketing updates</p>
              <p className="text-xs text-muted-foreground">Receive promo and partner announcements.</p>
            </div>
            <Switch
              checked={preferences.marketingOptIn}
              onCheckedChange={(checked) => void updatePreference({ marketingOptIn: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass mt-3 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Local notification toggles</CardDescription>
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
