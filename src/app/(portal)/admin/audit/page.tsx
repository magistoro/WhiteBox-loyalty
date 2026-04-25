"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, FileClock, Filter, Github, Search, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";

type AuditLevel = "info" | "warn" | "critical";
type AuditCategory = "security" | "user" | "subscription" | "billing" | "system";
type AuditWorkspace = "manager" | "developer";

type AuditLogItem = {
  id: string;
  at: string;
  actor: string;
  category: AuditCategory;
  action: string;
  target: string;
  level: AuditLevel;
  ip: string;
  country: string;
  result: "success" | "blocked";
  details: string;
  tags?: string[];
  workspace: AuditWorkspace;
  linkUrl?: string;
  linkLabel?: string;
};

const mockAuditLog: AuditLogItem[] = [
  {
    id: "evt_git_001",
    at: "2026-04-24T20:10:00.000Z",
    actor: "maksimpastuhov77@gmail.com",
    category: "system",
    action: "Release branch pushed to GitHub",
    target: "release/admin-security-crud-2026-04-24",
    level: "info",
    ip: "91.124.33.140",
    country: "RU",
    result: "success",
    details:
      "Branch pushed and pull request created for merge to main (PR #1: Release admin portal + API CRUD/security + docs/tests).",
    tags: ["GIT"],
    workspace: "developer",
    linkUrl: "https://github.com/magistoro/WhiteBox-loyalty/pull/1",
    linkLabel: "Open merge PR #1",
  },
  {
    id: "evt_9f11a2",
    at: "2026-04-24T17:42:00.000Z",
    actor: "maksimpastuhov77@gmail.com",
    category: "security",
    action: "Manual email recovery link sent",
    target: "masking20531@gmail.com",
    level: "warn",
    ip: "91.124.33.140",
    country: "RU",
    result: "success",
    details: "Recovery initiated by admin after document verification. One-time token expires in 30 minutes.",
    workspace: "manager",
  },
  {
    id: "evt_a71d4c",
    at: "2026-04-24T16:18:00.000Z",
    actor: "system",
    category: "security",
    action: "Unusual login geography detected",
    target: "2ccf5d7d-a33b-492e-838b-df357c919c1b",
    level: "critical",
    ip: "43.229.17.100",
    country: "IN",
    result: "blocked",
    details: "Login attempt blocked due to mismatch with primary country profile and prior IP behavior.",
    workspace: "manager",
  },
  {
    id: "evt_20b1d0",
    at: "2026-04-24T15:09:00.000Z",
    actor: "maksimpastuhov77@gmail.com",
    category: "subscription",
    action: "Company subscription updated",
    target: "uuid: sub_23f0",
    level: "info",
    ip: "91.124.33.140",
    country: "RU",
    result: "success",
    details: "Price and renewal period were updated for a company-bound subscription.",
    workspace: "manager",
  },
  {
    id: "evt_4c9b88",
    at: "2026-04-24T13:40:00.000Z",
    actor: "maksimpastuhov77@gmail.com",
    category: "user",
    action: "Account reactivated",
    target: "b2ec90fb-bb63-4426-a4cd-ca123b0f7234",
    level: "warn",
    ip: "91.124.33.140",
    country: "RU",
    result: "success",
    details: "Deletion schedule was cleared. Account status switched to ACTIVE.",
    workspace: "manager",
  },
  {
    id: "evt_7b6c31",
    at: "2026-04-24T10:22:00.000Z",
    actor: "system",
    category: "system",
    action: "Migration applied",
    target: "20260424190000_admin_security_and_company_crud",
    level: "info",
    ip: "127.0.0.1",
    country: "LOCAL",
    result: "success",
    details: "Database schema updated with login metadata and company CRUD dependencies.",
    workspace: "developer",
  },
  {
    id: "evt_dev_2381",
    at: "2026-04-24T09:36:00.000Z",
    actor: "system",
    category: "system",
    action: "API build pipeline succeeded",
    target: "whitebox-api / build / main",
    level: "info",
    ip: "127.0.0.1",
    country: "LOCAL",
    result: "success",
    details: "NestJS production bundle built successfully after tsconfig cleanup and route fixes.",
    workspace: "developer",
  },
  {
    id: "evt_mgr_5502",
    at: "2026-04-24T08:18:00.000Z",
    actor: "support-manager@whitebox.local",
    category: "user",
    action: "User profile corrected after KYC ticket",
    target: "uuid: 2ccf5d7d-a33b-492e-838b-df357c919c1b",
    level: "info",
    ip: "91.124.33.155",
    country: "RU",
    result: "success",
    details: "Support team updated non-sensitive profile metadata after identity verification request.",
    workspace: "manager",
  },
];

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  security: "Security",
  user: "Users",
  subscription: "Subscriptions",
  billing: "Billing",
  system: "System",
};

const LEVEL_STYLE: Record<AuditLevel, string> = {
  info: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/25",
  warn: "bg-amber-500/10 text-amber-300 border border-amber-400/25",
  critical: "bg-rose-500/10 text-rose-300 border border-rose-400/25",
};

export default function AdminAuditPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AuditCategory>("all");
  const [level, setLevel] = useState<"all" | AuditLevel>("all");
  const [workspace, setWorkspace] = useState<AuditWorkspace>("manager");

  const filtered = useMemo(() => {
    return mockAuditLog.filter((entry) => {
      const inWorkspace = entry.workspace === workspace;
      const inCategory = category === "all" || entry.category === category;
      const inLevel = level === "all" || entry.level === level;
      const q = query.trim().toLowerCase();
      const inQuery =
        q.length === 0 ||
        entry.action.toLowerCase().includes(q) ||
        entry.actor.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        (entry.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
      return inWorkspace && inCategory && inLevel && inQuery;
    });
  }, [category, level, query, workspace]);

  const criticalCount = filtered.filter((entry) => entry.level === "critical").length;
  const blockedCount = filtered.filter((entry) => entry.result === "blocked").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Separate streams for user operations (manager team) and technical operations (developer team).
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
          Read-only evidence stream
        </div>
      </div>

      <Card className="glass border-white/10">
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <button
            type="button"
            onClick={() => setWorkspace("manager")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              workspace === "manager"
                ? "bg-primary/15 text-primary"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/30",
            )}
          >
            Manager audit
          </button>
          <button
            type="button"
            onClick={() => setWorkspace("developer")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              workspace === "developer"
                ? "bg-primary/15 text-primary"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/30",
            )}
          >
            Developer audit
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            Active stream: {workspace === "manager" ? "Manager operations" : "Developer operations"}
          </span>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="glass border-white/10">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-primary/15 p-2 text-primary">
              <FileClock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Events in view</p>
              <p className="text-xl font-semibold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical alerts</p>
              <p className="text-xl font-semibold">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Blocked actions</p>
              <p className="text-xl font-semibold">{blockedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filter log stream
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by actor, action, target, #tag..."
              className="pl-9"
            />
          </div>
          <SelectField
            value={category}
            onChange={(event) => setCategory(event.target.value as "all" | AuditCategory)}
          >
            <option value="all">All categories</option>
            <option value="security">Security</option>
            <option value="user">Users</option>
            <option value="subscription">Subscriptions</option>
            <option value="billing">Billing</option>
            <option value="system">System</option>
          </SelectField>
          <SelectField
            value={level}
            onChange={(event) => setLevel(event.target.value as "all" | AuditLevel)}
          >
            <option value="all">All levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="critical">Critical</option>
          </SelectField>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((entry) => (
          <details
            key={entry.id}
            className="group rounded-2xl border border-white/10 bg-card/40 p-4 transition hover:border-white/20"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {entry.tags?.includes("GIT") && <Github className="h-4 w-4 text-muted-foreground" />}
                  {entry.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.at).toLocaleString()} | {entry.actor}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {entry.tags?.includes("GIT") && (
                  <span className="rounded-md border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-200">
                    #GIT
                  </span>
                )}
                <span className="rounded-md border border-white/10 bg-muted/25 px-2 py-1 text-[11px]">
                  {CATEGORY_LABEL[entry.category]}
                </span>
                <span className={cn("rounded-md px-2 py-1 text-[11px] uppercase", LEVEL_STYLE[entry.level])}>
                  {entry.level}
                </span>
              </div>
            </summary>

            <div className="mt-4 grid gap-3 border-t border-white/10 pt-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">{entry.target}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Result</p>
                <p
                  className={cn(
                    "font-medium",
                    entry.result === "blocked" ? "text-rose-300" : "text-emerald-300",
                  )}
                >
                  {entry.result.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IP / Country</p>
                <p className="font-medium">
                  {entry.ip} | {entry.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Event ID</p>
                <p className="font-mono text-xs text-muted-foreground">{entry.id}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{entry.details}</p>
            {entry.linkUrl && (
              <a
                href={entry.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {entry.linkLabel ?? "Open link"}
              </a>
            )}
          </details>
        ))}
        {filtered.length === 0 && (
          <Card className="glass border-white/10">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No events found for selected filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
