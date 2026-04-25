"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock3,
  Link2,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import {
  adminDeleteUser,
  adminForceLogoutUser,
  adminGetUser,
  adminReactivateUser,
  adminRequestEmailChange,
  adminUpdateUser,
  type AdminUserDetail,
} from "@/lib/api/admin-client";

type Role = "CLIENT" | "COMPANY" | "ADMIN";
type AccountStatus = "ACTIVE" | "FROZEN_PENDING_DELETION";

type FormState = {
  name: string;
  role: Role;
  accountStatus: AccountStatus;
  emailVerifiedAt: string;
  createdAt: string;
};

function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function toIsoOrNull(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function AdminUserProfilePage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const userUuid = params?.uuid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [forcingLogout, setForcingLogout] = useState(false);
  const [showCriticalAudit, setShowCriticalAudit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  async function loadProfile() {
    if (!userUuid) return;
    setLoading(true);
    setError(null);
    const result = await adminGetUser(userUuid);
    if (!result.ok) {
      setUser(null);
      setForm(null);
      setError(`Cannot load user (${result.status}): ${result.message}`);
      setLoading(false);
      return;
    }
    setUser(result.data);
    setForm({
      name: result.data.name,
      role: result.data.role,
      accountStatus: result.data.accountStatus,
      emailVerifiedAt: toDateTimeLocal(result.data.emailVerifiedAt),
      createdAt: toDateTimeLocal(result.data.createdAt),
    });
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    if (!userUuid) return;
    void (async () => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
      const result = await adminGetUser(userUuid);
      if (ignore) return;
      if (!result.ok) {
        setUser(null);
        setForm(null);
        setError(`Cannot load user (${result.status}): ${result.message}`);
        setLoading(false);
        return;
      }
      setUser(result.data);
      setForm({
        name: result.data.name,
        role: result.data.role,
        accountStatus: result.data.accountStatus,
        emailVerifiedAt: toDateTimeLocal(result.data.emailVerifiedAt),
        createdAt: toDateTimeLocal(result.data.createdAt),
      });
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [userUuid]);

  const relationsSummary = useMemo(() => {
    return [
      { label: "Favorite categories", value: user?.favoriteCategories.length ?? 0, icon: ShieldCheck },
      { label: "Company links", value: user?.companyLinks.length ?? 0, icon: Link2 },
      { label: "Subscriptions", value: user?.subscriptions.length ?? 0, icon: Users },
      { label: "Refresh tokens", value: user?.refreshTokens.length ?? 0, icon: Clock3 },
    ];
  }, [user]);

  async function onSave() {
    if (!form || !userUuid) return;
    setSaving(true);
    setNotice(null);
    const response = await adminUpdateUser(userUuid, {
      name: form.name,
      role: form.role,
      accountStatus: form.accountStatus,
      emailVerifiedAt: toIsoOrNull(form.emailVerifiedAt),
      createdAt: toIsoOrNull(form.createdAt),
    });
    setSaving(false);
    if (!response.ok) {
      setError(typeof response.message === "string" ? response.message : "Failed to update user.");
      return;
    }
    setError(null);
    setNotice("Profile updated.");
    setUser(response.data);
  }

  async function onReactivate() {
    if (!userUuid) return;
    const response = await adminReactivateUser(userUuid);
    if (!response.ok) {
      setError(String(response.message));
      return;
    }
    setError(null);
    setNotice("Account reactivated and deletion schedule cleared.");
    await loadProfile();
  }

  async function onRequestEmailChange() {
    if (!userUuid || !newEmail.trim()) return;
    setRequestingEmailChange(true);
    setNotice(null);
    const response = await adminRequestEmailChange(userUuid, newEmail.trim());
    setRequestingEmailChange(false);
    if (!response.ok) {
      setError(typeof response.message === "string" ? response.message : "Failed to send recovery email.");
      return;
    }
    setError(null);
    setNotice(
      response.data.previewUrl
        ? `Confirmation link sent. Dev preview: ${response.data.previewUrl}`
        : `Confirmation link sent to ${response.data.sentTo}.`,
    );
    setNewEmail("");
  }

  async function onDelete() {
    if (!userUuid) return;
    const check = window.prompt('Type "DELETE" to permanently remove this user');
    if (check !== "DELETE") return;
    setDeleting(true);
    const response = await adminDeleteUser(userUuid);
    setDeleting(false);
    if (!response.ok) {
      setError(typeof response.message === "string" ? response.message : "Delete failed.");
      return;
    }
    router.push("/admin/users");
  }

  async function onForceLogout() {
    if (!userUuid) return;
    setForcingLogout(true);
    const response = await adminForceLogoutUser(userUuid);
    setForcingLogout(false);
    if (!response.ok) {
      setError(typeof response.message === "string" ? response.message : "Force logout failed.");
      return;
    }
    setError(null);
    setNotice(`Revoked sessions: ${response.data.revokedSessions}.`);
    await loadProfile();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading user profile...</p>;
  }

  if (!user || !form) {
    return (
      <div className="space-y-4">
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </Button>
        <p className="text-sm text-destructive">{error ?? "User not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadProfile()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
          <Button variant="secondary" onClick={() => void onForceLogout()} disabled={forcingLogout}>
            <ShieldCheck className="h-4 w-4" />
            Force logout
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            Delete user
          </Button>
        </div>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{user.name}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{user.role}</Badge>
            <Badge variant={user.accountStatus === "ACTIVE" ? "default" : "destructive"}>
              {user.accountStatus}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">UUID: {user.uuid}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Display name</p>
              <Input value={form.name} onChange={(e) => setForm((p) => (p ? { ...p, name: e.target.value } : p))} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Role</p>
              <SelectField value={form.role} onChange={(e) => setForm((p) => (p ? { ...p, role: e.target.value as Role } : p))}>
                <option value="CLIENT">CLIENT</option>
                <option value="COMPANY">COMPANY</option>
                <option value="ADMIN">ADMIN</option>
              </SelectField>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Account status</p>
              <SelectField
                value={form.accountStatus}
                onChange={(e) => setForm((p) => (p ? { ...p, accountStatus: e.target.value as AccountStatus } : p))}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="FROZEN_PENDING_DELETION">FROZEN_PENDING_DELETION</option>
              </SelectField>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-muted/10 p-3">
              <p className="text-xs text-muted-foreground">Current email (read-only)</p>
              <p className="mt-1 text-sm font-medium">{user.email}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-muted/10 p-3">
              <p className="text-xs text-muted-foreground">Telegram ID (read-only)</p>
              <p className="mt-1 text-sm font-medium">{user.telegramId ?? "Not linked"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-3">
            <p className="text-sm font-medium">Reset account email</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Direct email editing is disabled. Send a secure confirmation link to the new email.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New verified email"
              />
              <Button onClick={onRequestEmailChange} disabled={requestingEmailChange || !newEmail.trim()}>
                <Mail className="h-4 w-4" />
                Send recovery link
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email verified at</p>
              <Input
                type="datetime-local"
                value={form.emailVerifiedAt}
                onChange={(e) => setForm((p) => (p ? { ...p, emailVerifiedAt: e.target.value } : p))}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Deletion scheduled at</p>
              <Input type="text" value={user.deletionScheduledAt ? new Date(user.deletionScheduledAt).toLocaleString() : "Not scheduled"} readOnly />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created at</p>
              <Input
                type="datetime-local"
                value={form.createdAt}
                onChange={(e) => setForm((p) => (p ? { ...p, createdAt: e.target.value } : p))}
              />
            </div>
          </div>
          {user.accountStatus === "FROZEN_PENDING_DELETION" && (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3">
              <p className="text-sm font-medium">Account is frozen pending deletion</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can unlock this account safely. Deletion schedule date is system-managed and read-only.
              </p>
              <Button className="mt-3" variant="secondary" onClick={() => void onReactivate()}>
                Reactivate account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader className="cursor-pointer" onClick={() => setShowCriticalAudit((prev) => !prev)}>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Critical security actions</span>
            {showCriticalAudit ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardTitle>
          <CardDescription>
            Email change, force logout, freeze and other sensitive admin actions
          </CardDescription>
        </CardHeader>
        {showCriticalAudit && (
          <CardContent className="space-y-2 text-sm">
            {user.criticalActions.length === 0 && (
              <p className="text-muted-foreground">No critical actions recorded yet.</p>
            )}
            {user.criticalActions.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-muted/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{entry.action}</p>
                  <Badge variant={entry.result === "BLOCKED" ? "destructive" : "secondary"}>
                    {entry.result}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()} • by {entry.actorLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.category} • {entry.level} • {(entry.ipAddress ?? "-")} {(entry.countryCode ? `(${entry.countryCode})` : "")}
                </p>
                {entry.details && <p className="mt-2 text-xs text-muted-foreground">{entry.details}</p>}
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {(error || notice) && (
        <Card className="glass border-white/10">
          <CardContent className="py-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-emerald-300 break-all">{notice}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Relations snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {relationsSummary.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-muted/10 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-muted/10 p-3 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserCircle2 className="h-3.5 w-3.5" />
                Metadata
              </div>
              <p className="mt-1 text-sm">Legacy ID: {user.id}</p>
              <p className="text-sm">Updated at: {new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Favorite categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user.favoriteCategories.length === 0 && <p className="text-muted-foreground">No favorite categories.</p>}
            {user.favoriteCategories.map((fav) => (
              <div key={fav.id} className="rounded-xl border border-white/10 bg-muted/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/15 p-1.5">
                    <CategoryIcon iconName={fav.category.icon} className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium leading-none">{fav.category.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">/{fav.category.slug}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Company links</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Company</th>
                <th>Category</th>
                <th>Balance</th>
                <th>Next reward</th>
                <th>Expiring points</th>
              </tr>
            </thead>
            <tbody>
              {user.companyLinks.map((link) => (
                <tr key={link.id} className="border-t border-white/10">
                  <td className="py-2">{link.company.name}</td>
                  <td>{link.company.category.name}</td>
                  <td>{link.balance}</td>
                  <td>{link.pointsToNextReward ?? "-"}</td>
                  <td>{link.expiringPoints ?? "-"}</td>
                </tr>
              ))}
              {user.companyLinks.length === 0 && (
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={5}>No company links.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Subscription</th>
                <th>Status</th>
                <th>Auto renew</th>
                <th>Activated</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {user.subscriptions.map((sub) => (
                <tr key={sub.id} className="border-t border-white/10">
                  <td className="py-2">{sub.subscription.name}</td>
                  <td>{sub.status}</td>
                  <td>{sub.willAutoRenew ? "Yes" : "No"}</td>
                  <td>{new Date(sub.activatedAt).toLocaleString()}</td>
                  <td>{sub.expiresAt ? new Date(sub.expiresAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {user.subscriptions.length === 0 && (
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={5}>No subscriptions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Operations history</CardTitle>
          <CardDescription>Subscriptions and loyalty point activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.subscriptions.map((sub) => (
            <div key={`sub-${sub.id}`} className="rounded-lg border border-white/10 bg-muted/10 p-2">
              <p className="font-medium">
                Subscription: {sub.subscription.name} ({sub.status})
              </p>
              <p className="text-xs text-muted-foreground">
                Activated {new Date(sub.activatedAt).toLocaleString()} • Expires {sub.expiresAt ? new Date(sub.expiresAt).toLocaleString() : "n/a"}
              </p>
            </div>
          ))}
          {user.loyaltyTransactions.map((tx) => (
            <div key={tx.uuid} className="rounded-lg border border-white/10 bg-muted/10 p-2">
              <p className="font-medium">
                {tx.type === "EARN" ? "Earned" : "Spent"} {tx.amount} pts at {tx.company.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.occurredAt).toLocaleString()} • {tx.status}
                {tx.description ? ` • ${tx.description}` : ""}
              </p>
            </div>
          ))}
          {user.subscriptions.length === 0 && user.loyaltyTransactions.length === 0 && (
            <p className="text-muted-foreground">No operations history yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Login security metadata</CardTitle>
          <CardDescription>
            Primary country: {user.loginRisk.primaryCountry ?? "n/a"} • Latest: {user.loginRisk.latestCountry ?? "n/a"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className={user.loginRisk.shouldReview ? "text-amber-300" : "text-emerald-300"}>
            {user.loginRisk.shouldReview
              ? "Potential anomaly detected: review cross-country/device login pattern before sensitive account actions."
              : "No obvious anomaly in recent login geography."}
          </p>
          {user.loginEvents.map((evt) => (
            <div key={evt.id} className="rounded-lg border border-white/10 bg-muted/10 p-2">
              <p className="font-medium">
                {evt.countryCode ?? "??"} • {evt.city ?? "Unknown city"} • {evt.ipAddress ?? "Unknown IP"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(evt.createdAt).toLocaleString()} • {evt.deviceLabel ?? "Unknown device"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{evt.userAgent ?? "No user-agent"}</p>
            </div>
          ))}
          {user.loginEvents.length === 0 && <p className="text-muted-foreground">No login metadata recorded yet.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Refresh tokens (latest 20)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {user.refreshTokens.length === 0 && <p className="text-muted-foreground">No tokens.</p>}
            {user.refreshTokens.map((token) => (
              <div key={token.id} className="rounded-md border border-white/10 p-2 font-mono">
                <p>{token.id}</p>
                <p className="text-muted-foreground">
                  exp {new Date(token.expiresAt).toLocaleString()} • {token.revokedAt ? "revoked" : "active"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">OAuth accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user.oauthAccounts.length === 0 && <p className="text-muted-foreground">No OAuth providers linked.</p>}
            {user.oauthAccounts.map((account) => (
              <div key={account.id} className="rounded-md border border-white/10 p-2">
                <p className="font-medium">{account.provider}</p>
                <p className="text-xs text-muted-foreground">{account.providerAccountId}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
