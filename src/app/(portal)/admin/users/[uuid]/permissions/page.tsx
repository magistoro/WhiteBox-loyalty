"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  Database,
  Eye,
  Headphones,
  LockKeyhole,
  Pencil,
  Save,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  adminGetUserPermissions,
  adminUpdateUserPermissions,
  type AdminPermissionScope,
  type AdminRole,
  type AdminUserPermissionRow,
  type AdminUserPermissionsResponse,
} from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

const scopeMeta: Record<AdminPermissionScope, {
  title: string;
  description: string;
  icon: typeof Users;
  risk: "safe" | "medium" | "high";
}> = {
  USERS: {
    title: "Users",
    description: "Client profiles, account status, sessions and sensitive support actions.",
    icon: Users,
    risk: "high",
  },
  COMPANIES: {
    title: "Companies",
    description: "Company profiles, subscriptions, categories and client records.",
    icon: BadgeCheck,
    risk: "medium",
  },
  COMPANY_VERIFICATIONS: {
    title: "Company verification",
    description: "Legal details, payout data and passport verification status.",
    icon: ShieldCheck,
    risk: "high",
  },
  FINANCE: {
    title: "Finance operations",
    description: "Payout requests, approvals, refunds and payment execution flow.",
    icon: Banknote,
    risk: "high",
  },
  SUPPORT: {
    title: "Support desk",
    description: "Safe workspace for conversations and low-risk user assistance.",
    icon: Headphones,
    risk: "safe",
  },
  AUDIT: {
    title: "Audit log",
    description: "Manager and developer audit events, security trail and release notes.",
    icon: SlidersHorizontal,
    risk: "medium",
  },
  DATABASE: {
    title: "Database map",
    description: "Visual schema map and structural data overview.",
    icon: Database,
    risk: "high",
  },
  TELEGRAM: {
    title: "Telegram notifications",
    description: "Admin Telegram linking, bot delivery and notification routing.",
    icon: Send,
    risk: "medium",
  },
  SETTINGS: {
    title: "System settings",
    description: "Feature flags, service configuration and operational controls.",
    icon: Settings,
    risk: "high",
  },
};

const rolePresets: Record<Exclude<AdminRole, "CLIENT" | "COMPANY">, Partial<Record<AdminPermissionScope, Pick<AdminUserPermissionRow, "canView" | "canEdit" | "canApprove">>>> = {
  ADMIN: {},
  SUPER_ADMIN: {},
  MANAGER: {
    USERS: { canView: true, canEdit: false, canApprove: false },
    COMPANIES: { canView: true, canEdit: true, canApprove: false },
    COMPANY_VERIFICATIONS: { canView: true, canEdit: true, canApprove: true },
    FINANCE: { canView: true, canEdit: true, canApprove: false },
    SUPPORT: { canView: true, canEdit: true, canApprove: false },
    AUDIT: { canView: true, canEdit: false, canApprove: false },
    TELEGRAM: { canView: true, canEdit: false, canApprove: false },
  },
  SUPPORT: {
    USERS: { canView: true, canEdit: false, canApprove: false },
    SUPPORT: { canView: true, canEdit: true, canApprove: false },
  },
};

function applyPreset(
  current: AdminUserPermissionRow[],
  role: Exclude<AdminRole, "CLIENT" | "COMPANY">,
): AdminUserPermissionRow[] {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return current.map((permission) => ({ ...permission, canView: true, canEdit: true, canApprove: true }));
  }

  const preset = rolePresets[role];
  return current.map((permission) => ({
    scope: permission.scope,
    canView: preset[permission.scope]?.canView ?? false,
    canEdit: preset[permission.scope]?.canEdit ?? false,
    canApprove: preset[permission.scope]?.canApprove ?? false,
  }));
}

function riskClass(risk: "safe" | "medium" | "high") {
  if (risk === "safe") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (risk === "medium") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-red-300/25 bg-red-300/10 text-red-100";
}

export default function UserPermissionsPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [data, setData] = useState<AdminUserPermissionsResponse | null>(null);
  const [permissions, setPermissions] = useState<AdminUserPermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const allowedCount = useMemo(
    () => permissions.reduce((sum, permission) => sum + Number(permission.canView) + Number(permission.canEdit) + Number(permission.canApprove), 0),
    [permissions],
  );
  const highRiskApprovals = useMemo(
    () => permissions.filter((permission) => permission.canApprove && scopeMeta[permission.scope].risk === "high").length,
    [permissions],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setMessage("");
      const result = await adminGetUserPermissions(uuid);
      if (!active) return;
      if (result.ok) {
        setData(result.data);
        setPermissions(result.data.permissions);
      } else {
        setMessage(result.message);
      }
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [uuid]);

  function toggle(scope: AdminPermissionScope, field: "canView" | "canEdit" | "canApprove") {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.scope !== scope) return permission;
        const next = { ...permission, [field]: !permission[field] };
        if (field === "canEdit" && next.canEdit) next.canView = true;
        if (field === "canApprove" && next.canApprove) next.canView = true;
        return next;
      }),
    );
  }

  function setPreset(role: Exclude<AdminRole, "CLIENT" | "COMPANY">) {
    setPermissions((prev) => applyPreset(prev, role));
    setMessage(`${role} preset applied locally. Save to persist it.`);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const result = await adminUpdateUserPermissions(uuid, permissions);
    setSaving(false);
    if (result.ok) {
      setData(result.data);
      setPermissions(result.data.permissions);
      setMessage("Access settings saved.");
    } else {
      setMessage(result.message);
    }
  }

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">
        Loading permissions...
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="secondary">
          <Link href={`/admin/users/${uuid}`}>
            <ArrowLeft className="h-4 w-4" /> Back to user
          </Link>
        </Button>
        <Button onClick={save} disabled={saving || !data}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save access settings"}
        </Button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.13),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-muted-foreground">
              <LockKeyhole className="h-4 w-4" /> Individual RBAC cockpit
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Access settings</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Fine tune what this teammate can view, edit and approve. Approvals are intentionally separated from editing.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
              <p className="text-xs text-muted-foreground">User</p>
              <p className="mt-1 font-semibold">{data?.user.name ?? "Unknown"}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{data?.user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
              <p className="text-xs text-muted-foreground">Current role</p>
              <p className="mt-1 font-semibold">{data?.user.role ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
              <p className="text-xs text-muted-foreground">Allowed toggles</p>
              <p className="mt-1 text-2xl font-semibold">{allowedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm">
          {message}
        </div>
      )}

      {highRiskApprovals > 0 && (
        <div className="rounded-2xl border border-red-300/25 bg-red-300/10 p-4 text-sm text-red-100">
          {highRiskApprovals} high-risk approval scope(s) enabled. Double-check before saving.
        </div>
      )}

      <Card className="border-white/10 bg-card/70">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Role presets</h2>
              <p className="text-sm text-muted-foreground">Quickly apply a sane baseline, then adjust individual scopes below.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["SUPER_ADMIN", "MANAGER", "SUPPORT"] as const).map((role) => (
                <Button key={role} type="button" variant="secondary" onClick={() => setPreset(role)}>
                  <UserCog className="h-4 w-4" /> {role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {permissions.map((permission) => {
          const meta = scopeMeta[permission.scope];
          const Icon = meta.icon;
          return (
            <Card key={permission.scope} className="overflow-hidden border-white/10 bg-card/70">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{meta.title}</h3>
                        <Badge variant="outline" className={riskClass(meta.risk)}>{meta.risk} risk</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    ["canView", "View", Eye],
                    ["canEdit", "Edit", Pencil],
                    ["canApprove", "Approve", Check],
                  ] as const).map(([field, label, ToggleIcon]) => {
                    const enabled = permission[field];
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => toggle(permission.scope, field)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                          enabled
                            ? "border-white/30 bg-white text-black shadow-[0_0_22px_rgba(255,255,255,0.18)]"
                            : "border-white/10 bg-black/18 text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
                        )}
                      >
                        <ToggleIcon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
