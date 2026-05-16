"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  CircleAlert,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Globe2,
  Mail,
  MessageSquareText,
  Send,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  TimerReset,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGetLandingLead,
  adminRetryLandingLead,
  adminUpdateLandingLead,
  type AdminLandingLead,
  type AdminLandingLeadStatus,
} from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

const statusOptions: Array<{ value: AdminLandingLeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "CLOSED", label: "Closed" },
  { value: "SPAM", label: "Spam" },
];

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusMeta(status: AdminLandingLeadStatus) {
  if (status === "NEW") return { icon: Sparkles, className: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100" };
  if (status === "IN_PROGRESS") return { icon: Clock3, className: "border-amber-300/25 bg-amber-300/10 text-amber-100" };
  if (status === "CLOSED") return { icon: CheckCircle2, className: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" };
  return { icon: ShieldAlert, className: "border-red-300/25 bg-red-300/10 text-red-100" };
}

function FieldCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-4", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 min-w-0 break-words text-lg font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}

function contactHref(contact: string) {
  const value = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { href: `mailto:${value}`, label: "Write email", icon: Mail };
  }

  const telegramUsername = value.match(/^@?([a-zA-Z0-9_]{5,32})$/)?.[1];
  if (telegramUsername && !value.includes("@", 1)) {
    return { href: `https://t.me/${telegramUsername}`, label: "Open Telegram", icon: Send };
  }

  return null;
}

function ContactCard({ contact }: { contact: string }) {
  const action = contactHref(contact);
  const ActionIcon = action?.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</p>
      {action ? (
        <a
          href={action.href}
          target={action.href.startsWith("http") ? "_blank" : undefined}
          rel={action.href.startsWith("http") ? "noreferrer" : undefined}
          title={contact}
          className="mt-2 flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-foreground transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="min-w-0 flex-1 truncate text-lg font-semibold leading-6">{contact}</span>
        </a>
      ) : (
        <p title={contact} className="mt-2 truncate text-lg font-semibold leading-6 text-foreground">
          {contact}
        </p>
      )}
      {action && <p className="mt-2 text-xs text-muted-foreground">{action.label}</p>}
    </div>
  );
}

function ContextRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  tone?: "good" | "warn" | "danger";
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
          tone === "danger"
            ? "border-red-300/20 bg-red-300/10 text-red-100"
            : tone === "warn"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-white/[0.06] text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 break-words font-semibold leading-6">{value}</p>
      </div>
    </div>
  );
}

function processingSummary(status: AdminLandingLeadStatus, failedCount: number) {
  if (failedCount > 0) {
    return {
      title: "Needs Telegram retry",
      text: "Last notification delivery has failed. Retry from the button above after checking bot/proxy settings.",
      icon: CircleAlert,
      className: "border-red-300/20 bg-red-300/10 text-red-100",
    };
  }

  if (status === "CLOSED") {
    return {
      title: "Lead is closed",
      text: "This request is already processed. Keep notes updated for future context.",
      icon: CheckCircle2,
      className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    };
  }

  if (status === "SPAM") {
    return {
      title: "Marked as spam",
      text: "Do not contact this lead unless you manually confirm the request is legitimate.",
      icon: ShieldAlert,
      className: "border-red-300/20 bg-red-300/10 text-red-100",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      title: "Waiting for manager action",
      text: "The lead is being handled. Add notes before changing the status.",
      icon: Clock3,
      className: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    };
  }

  return {
    title: "Fresh lead",
    text: "Review the message, contact the person, then move it to In progress or Closed.",
    icon: Sparkles,
    className: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  };
}

export default function AdminLandingLeadDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const [uuid, setUuid] = useState("");
  const [lead, setLead] = useState<AdminLandingLead | null>(null);
  const [status, setStatus] = useState<AdminLandingLeadStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadLead(id: string) {
    setLoading(true);
    const result = await adminGetLandingLead(id);
    if (result.ok) {
      setLead(result.data);
      setStatus(result.data.status);
      setNotes(result.data.notes ?? "");
      setMessage("");
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    params.then(({ uuid: routeUuid }) => {
      setUuid(routeUuid);
      loadLead(routeUuid);
    });
  }, [params]);

  async function saveLead() {
    if (!uuid) return;
    setSaving(true);
    const result = await adminUpdateLandingLead(uuid, { status, notes });
    setSaving(false);
    if (result.ok) {
      setLead((current) => (current ? { ...current, status: result.data.status, notes: result.data.notes } : current));
      setMessage("Lead updated.");
    } else {
      setMessage(result.message);
    }
  }

  async function retryLead() {
    if (!uuid) return;
    setSaving(true);
    const result = await adminRetryLandingLead(uuid);
    setSaving(false);
    if (result.ok) {
      setMessage(`Retry finished: ${result.data.result.sent} sent, ${result.data.result.failed} failed.`);
      await loadLead(uuid);
    } else {
      setMessage(result.message);
    }
  }

  if (loading) {
    return <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">Loading lead...</Card>;
  }

  if (!lead) {
    return <Card className="border-white/10 bg-white/[0.04] p-6 text-red-100">{message || "Lead not found."}</Card>;
  }

  const meta = statusMeta(lead.status);
  const StatusIcon = meta.icon;
  const failedCount = lead.deliveries.filter((delivery) => delivery.status === "FAILED").length;
  const latestDelivery = lead.deliveries[0] ?? null;
  const summary = processingSummary(lead.status, failedCount);
  const SummaryIcon = summary.icon;

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-5">
      <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.11),transparent_34%),rgba(255,255,255,0.035)] p-5 shadow-[0_0_50px_rgba(255,255,255,0.04)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Button asChild variant="secondary" className="mb-5 rounded-xl">
              <Link href="/admin/leads">
                <ArrowLeft className="h-4 w-4" /> Back to leads
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">{lead.name}</h1>
              <Badge variant="outline" className={cn("gap-1 rounded-full px-3 py-1", meta.className)}>
                <StatusIcon className="h-4 w-4" /> {lead.status}
              </Badge>
            </div>
            <p className="mt-3 max-w-3xl break-all text-sm text-muted-foreground">{lead.uuid}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
            <Button variant="secondary" onClick={retryLead} disabled={saving} className="rounded-xl">
              <RefreshCw className="h-4 w-4" /> Retry Telegram
            </Button>
            <Button onClick={saveLead} disabled={saving} className="rounded-xl bg-white text-black hover:bg-white/90">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FieldCard label="Company" value={lead.company || "not provided"} />
          <FieldCard label="Business" value={lead.business || "not provided"} />
          <ContactCard contact={lead.contact} />
          <FieldCard label="Created" value={formatDate(lead.createdAt)} />
        </div>
      </div>

      {message && <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-foreground">{message}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardContent className="p-0">
            <div className="border-b border-white/10 bg-white/[0.035] px-6 py-5">
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]"><UserRound className="h-5 w-5" /></span>
                Lead profile
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  <MessageSquareText className="h-4 w-4" /> Message
                </div>
                <p className="whitespace-pre-wrap break-words text-lg font-semibold leading-8">{lead.message}</p>
              </div>
              <div className="grid gap-3">
                <ContextRow icon={Globe2} label="Source" value={`${lead.source} · ${lead.ipAddress || "unknown IP"}`} />
                <ContextRow icon={Fingerprint} label="Fingerprint" value={lead.fingerprint.slice(0, 18) + "..."} />
                <ContextRow
                  icon={ShieldAlert}
                  label="Spam review"
                  value={lead.spamScore > 0 ? `Score ${lead.spamScore}. Review before replying.` : "Clean signal. No spam markers detected."}
                  tone={lead.spamScore > 0 ? "warn" : "good"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardContent className="p-0">
            <div className="border-b border-white/10 bg-white/[0.035] px-6 py-5">
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]"><BellRing className="h-5 w-5" /></span>
                Processing
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                  <SelectField value={status} onChange={(event) => setStatus(event.target.value as AdminLandingLeadStatus)} className="h-12 rounded-xl">
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Internal notes</p>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Internal notes for this lead..."
                    className="min-h-40 rounded-xl"
                  />
                </div>
              </div>
              <div className={cn("rounded-2xl border p-4", summary.className)}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20">
                    <SummaryIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{summary.title}</p>
                    <p className="mt-1 text-sm opacity-80">{summary.text}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ContextRow
                  icon={BellRing}
                  label="Last Telegram delivery"
                  value={
                    latestDelivery
                      ? `${latestDelivery.status} · ${latestDelivery.lastError || formatDate(latestDelivery.sentAt || latestDelivery.createdAt)}`
                      : "No delivery attempts yet."
                  }
                  tone={latestDelivery?.status === "FAILED" ? "danger" : "good"}
                />
                <ContextRow
                  icon={TimerReset}
                  label="Processed at"
                  value={formatDate(lead.processedAt)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
        <CardContent className="p-0">
          <div className="flex flex-col gap-2 border-b border-white/10 bg-white/[0.035] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]"><Mail className="h-5 w-5" /></span>
              Notification history
            </h2>
            <p className="text-sm text-muted-foreground">{lead.deliveries.length} delivery record(s)</p>
          </div>
          <div className="space-y-3 p-6">
            {lead.deliveries.length === 0 ? (
              <p className="text-muted-foreground">No delivery attempts yet.</p>
            ) : (
              lead.deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 lg:grid-cols-[minmax(180px,0.8fr)_120px_140px_minmax(0,1.4fr)] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{delivery.recipientLabel || delivery.recipientRole}</p>
                    <p className="mt-1 break-all text-sm text-muted-foreground">{delivery.recipientChatId}</p>
                  </div>
                  <Badge variant="outline" className={cn("w-fit rounded-full", delivery.status === "SENT" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-red-300/25 bg-red-300/10 text-red-100")}>{delivery.status}</Badge>
                  <p className="text-sm text-muted-foreground">{delivery.attempts} attempt(s)</p>
                  <p className="min-w-0 break-words text-sm text-muted-foreground">
                    {delivery.lastError || `Sent at ${formatDate(delivery.sentAt)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
