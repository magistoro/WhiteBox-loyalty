"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileBadge2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldX,
  UserRound,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminGetCompanyVerification,
  adminListAuditEvents,
  adminUpdateCompanyVerification,
  type AdminAuditRow,
  type AdminCompanyVerificationApplication,
  type AdminCompanyVerificationStatus,
} from "@/lib/api/admin-client";
import { cn } from "@/lib/utils";

function statusClass(status: AdminCompanyVerificationStatus) {
  if (status === "SUBMITTED") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  if (status === "REVIEWING") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (status === "APPROVED") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (status === "REJECTED") return "border-red-300/30 bg-red-300/10 text-red-100";
  return "border-white/10 bg-white/[0.05] text-muted-foreground";
}

function employmentLabel(value: AdminCompanyVerificationApplication["employmentType"]) {
  return value === "SELF_EMPLOYED" ? "Self-employed" : "Individual entrepreneur";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Field({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: typeof UserRound;
  href?: string;
}) {
  const content = value === null || value === undefined || value === "" ? "-" : String(value);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </p>
      {href && content !== "-" ? (
        <a href={href} className="mt-2 block break-words text-base font-semibold text-cyan-100 hover:underline">
          {content}
        </a>
      ) : (
        <p className="mt-2 break-words text-base font-semibold">{content}</p>
      )}
    </div>
  );
}

export default function CompanyVerificationDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const [application, setApplication] = useState<AdminCompanyVerificationApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [auditRows, setAuditRows] = useState<AdminAuditRow[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const passportFile = application?.passportFiles?.[0];

  const telegramHref = useMemo(() => {
    if (!application?.contactTelegram) return undefined;
    const username = application.contactTelegram.replace(/^@/, "");
    return `https://t.me/${username}`;
  }, [application?.contactTelegram]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      const result = await adminGetCompanyVerification(uuid);
      if (!active) return;
      if (result.ok) setApplication(result.data);
      else setError(result.message);
      const audit = await adminListAuditEvents({ workspace: "MANAGER", query: uuid, tag: "USER", limit: 20 });
      if (active && audit.ok) setAuditRows(audit.data.items);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [uuid]);

  async function updateStatus(status: Exclude<AdminCompanyVerificationStatus, "DRAFT">) {
    setSaving(true);
    setError("");
    setNotice("");
    const result = await adminUpdateCompanyVerification(uuid, { status });
    if (result.ok) {
      setApplication(result.data);
      setNotice(`Status updated to ${status}.`);
      const audit = await adminListAuditEvents({ workspace: "MANAGER", query: uuid, tag: "USER", limit: 20 });
      if (audit.ok) setAuditRows(audit.data.items);
    } else {
      setError(result.message);
    }
    setSaving(false);
  }

  if (loading) {
    return <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">Loading verification request...</Card>;
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <Button asChild variant="secondary">
          <Link href="/admin/company-verifications"><ArrowLeft className="h-4 w-4" /> Back to verifications</Link>
        </Button>
        <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
          {error || "Company verification request not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <Button asChild variant="secondary">
            <Link href="/admin/company-verifications"><ArrowLeft className="h-4 w-4" /> Back to verifications</Link>
          </Button>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{application.companyName}</h1>
            <Badge variant="outline" className={statusClass(application.status)}>{application.status}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {application.uuid} · submitted {formatDate(application.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={saving} onClick={() => updateStatus("REVIEWING")}>
            <Clock3 className="h-4 w-4" /> Mark reviewing
          </Button>
          <Button disabled={saving} onClick={() => updateStatus("APPROVED")}>
            <CheckCircle2 className="h-4 w-4" /> Approve
          </Button>
          <Button variant="destructive" disabled={saving} onClick={() => updateStatus("REJECTED")}>
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={cn(
            "rounded-xl border p-4 text-sm",
            error ? "border-red-400/25 bg-red-500/10 text-red-100" : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
          )}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardHeader className="border-b border-white/10 bg-white/[0.035]">
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" /> Company request
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Company" value={application.companyName} icon={BriefcaseBusiness} />
            <Field label="Employment type" value={employmentLabel(application.employmentType)} icon={BadgeCheck} />
            <Field
              label="Identity mode"
              value={application.identityVerificationMode === "FULL" ? "Full verification" : "Deferred / test access"}
              icon={ShieldCheck}
            />
            <Field label="Business category" value={application.businessCategory} icon={FileBadge2} />
            <Field label="Linked company" value={application.company ? `${application.company.name} (${application.company.slug})` : "-"} icon={ShieldCheck} />
            <Field label="Company active" value={application.company?.isActive ? "Yes" : "No"} icon={application.company?.isActive ? ShieldCheck : ShieldX} />
            <Field label="Admin notified" value={formatDate(application.adminNotifiedAt)} icon={Mail} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardHeader className="border-b border-white/10 bg-white/[0.035]">
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5">
            <Field label="Contact name" value={application.contactName} icon={UserRound} />
            <Field label="Email" value={application.contactEmail} icon={Mail} href={`mailto:${application.contactEmail}`} />
            <Field label="Telegram" value={application.contactTelegram} icon={Phone} href={telegramHref} />
            <Field label="IP / User agent" value={`${application.ipAddress ?? "-"} / ${application.userAgent ?? "-"}`} icon={MapPin} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardHeader className="border-b border-white/10 bg-white/[0.035]">
            <CardTitle className="flex items-center gap-2">
              <FileBadge2 className="h-5 w-5" /> Legal verification data
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Legal full name" value={application.legalFullName} />
            <Field label="Birth date" value={formatDate(application.birthDate)} />
            <Field label="INN" value={application.legalInn} />
            <Field label="Passport last 4" value={application.passportLast4} />
            <Field label="Consent accepted" value={formatDate(application.consentAcceptedAt)} />
            <Field
              label="Passport photo safety"
              value={
                passportFile
                  ? `Encrypted file attached · ${Math.round(passportFile.size / 1024)} KB · ${passportFile.mimeType}`
                  : `No active passport file · cleanup: ${formatDate(application.passportDataDeletedAt)}`
              }
            />
            {application.identityVerificationMode === "DEFERRED" && (
              <Field label="Deferred verification reason" value={application.verificationDeferralReason} />
            )}
            {passportFile && (
              <Button asChild variant="secondary" className="sm:col-span-2">
                <a href={`/api/admin/company-verifications/${application.uuid}/passport-photo`} target="_blank" rel="noreferrer">
                  <ShieldCheck className="h-4 w-4" /> Open encrypted passport photo
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
          <CardHeader className="border-b border-white/10 bg-white/[0.035]">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" /> Payout details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label="Status"
              value="Deferred. Payout fields depend on business type and will be requested after verification."
            />
            <Field label="Reviewed at" value={formatDate(application.company?.verificationReviewedAt)} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-white/10 bg-card/70 p-0">
        <CardHeader className="cursor-pointer border-b border-white/10 bg-white/[0.035]" onClick={() => setShowAudit((value) => !value)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Verification audit trail</span>
            <span className="text-sm text-muted-foreground">{showAudit ? "Hide" : "Show"}</span>
          </CardTitle>
        </CardHeader>
        {showAudit && (
          <CardContent className="space-y-3 p-5">
            {auditRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No verification audit events yet.</p>
            ) : (
              auditRows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{row.action}</p>
                    <Badge variant="outline">{row.level}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()} · {row.actorLabel}
                  </p>
                  {row.details && <p className="mt-2 text-sm text-muted-foreground">{row.details}</p>}
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
