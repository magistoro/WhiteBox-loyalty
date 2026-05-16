"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminListCompanyVerifications,
  adminSyncPassportStorage,
  type AdminCompanyVerificationApplication,
  type AdminCompanyVerificationStatus,
} from "@/lib/api/admin-client";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/shared";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";

const statuses: Array<{ value: AdminCompanyVerificationStatus | "ALL"; labelKey: TranslationKey; icon: typeof FileSearch }> = [
  { value: "ALL", labelKey: "admin.common.all", icon: FileSearch },
  { value: "SUBMITTED", labelKey: "admin.common.submitted", icon: Clock3 },
  { value: "REVIEWING", labelKey: "admin.common.reviewing", icon: ShieldCheck },
  { value: "APPROVED", labelKey: "admin.common.approved", icon: CheckCircle2 },
  { value: "REJECTED", labelKey: "admin.common.rejected", icon: XCircle },
];

function statusClass(status: AdminCompanyVerificationStatus) {
  if (status === "SUBMITTED") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  if (status === "REVIEWING") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (status === "APPROVED") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (status === "REJECTED") return "border-red-300/30 bg-red-300/10 text-red-100";
  return "border-white/10 bg-white/[0.05] text-muted-foreground";
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function compactEmail(email: string) {
  if (email.length <= 28) return email;
  const [name, domain] = email.split("@");
  return `${name.slice(0, 12)}...@${domain}`;
}

export default function AdminCompanyVerificationsPage() {
  const { locale, t } = useI18n("ru");
  const [items, setItems] = useState<AdminCompanyVerificationApplication[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminCompanyVerificationStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Partial<Record<AdminCompanyVerificationStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");

  const openCount = useMemo(
    () => (summary.SUBMITTED ?? 0) + (summary.REVIEWING ?? 0),
    [summary],
  );

  useEffect(() => {
    let active = true;
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const result = await adminListCompanyVerifications({ query, status, page, limit: 12 });
      if (!active) return;
      if (!result.ok) {
        setError(result.message);
        setItems([]);
      } else {
        setItems(result.data.items);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
        setSummary(result.data.summary);
      }
      setLoading(false);
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [query, status, page]);

  async function syncStorage() {
    setSyncing(true);
    setError("");
    setSyncNotice("");
    const result = await adminSyncPassportStorage();
    if (result.ok) {
      const report = result.data.result;
      setSyncNotice(
        `${t("admin.verifications.storageSynced")}: ${report.activeDbRecords} ${t("admin.verifications.dbRecords")}, ${report.encryptedFilesOnDisk} ${t("admin.verifications.files")}, ${report.missingFiles} ${t("admin.verifications.missing")}, ${report.orphanFilesDeleted} ${t("admin.verifications.orphansDeleted")}.`,
      );
    } else {
      setError(result.message);
    }
    setSyncing(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4" /> {t("admin.verifications.badge")}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("admin.verifications.title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("admin.verifications.description")}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.common.total")}</p>
            <p className="text-2xl font-semibold">{total}</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.common.open")}</p>
            <p className="text-2xl font-semibold text-cyan-100">{openCount}</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.common.approved")}</p>
            <p className="text-2xl font-semibold text-emerald-100">{summary.APPROVED ?? 0}</p>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div>
          <p className="font-semibold">{t("admin.verifications.storageTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("admin.verifications.storageDescription")}</p>
        </div>
        <Button variant="secondary" disabled={syncing} onClick={syncStorage}>
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> {t("admin.verifications.syncStorage")}
        </Button>
      </div>

      <Card className="border-white/10 bg-card/70 p-0">
        <CardHeader className="px-8 pb-4 pt-7">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" /> {t("admin.common.searchFilters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-7">
          <Input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder={t("admin.verifications.searchPlaceholder")}
          />
          <div className="flex flex-wrap gap-2">
            {statuses.map(({ value, labelKey, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setStatus(value);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                  status === value
                    ? "border-white/30 bg-white text-black"
                    : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t(labelKey)}
                {value !== "ALL" && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{summary[value] ?? 0}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(error || syncNotice) && (
        <div className={cn(
          "rounded-xl border p-4 text-sm",
          error ? "border-red-400/25 bg-red-500/10 text-red-100" : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
        )}>
          {error || syncNotice}
        </div>
      )}

      <div className="grid gap-3">
        {loading ? (
          <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">{t("admin.verifications.loading")}</Card>
        ) : items.length === 0 ? (
          <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">{t("admin.verifications.empty")}</Card>
        ) : (
          items.map((item) => (
            <Link key={item.uuid} href={`/admin/company-verifications/${item.uuid}`} className="group block">
              <Card className="overflow-hidden border-white/10 bg-white/[0.04] p-0 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                <CardContent className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.4fr)_180px_170px_120px_auto] xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">{item.companyName}</h2>
                      <Badge variant="outline" className={statusClass(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BriefcaseBusiness className="h-4 w-4" /> {item.employmentType === "SELF_EMPLOYED" ? t("admin.verifications.selfEmployed") : t("admin.verifications.individualEntrepreneur")}
                      </span>
                      <span>{item.identityVerificationMode === "FULL" ? t("admin.verifications.fullVerification") : t("admin.verifications.testAccess")}</span>
                      <span>{item.businessCategory}</span>
                      <span title={item.contactEmail}>{compactEmail(item.contactEmail)}</span>
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("admin.verifications.inn")}</p>
                    <p className="font-medium">{item.legalInn}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("admin.common.created")}</p>
                    <p className="font-medium">{formatDate(item.createdAt, locale)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("admin.common.company")}</p>
                    <p className={cn("font-medium", item.company?.isActive ? "text-emerald-100" : "text-amber-100")}>
                      {item.company?.isActive ? t("admin.common.active") : t("admin.common.inactive")}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("admin.common.page")} {page} / {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{t("admin.common.prev")}</Button>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>{t("admin.common.next")}</Button>
        </div>
      </div>
    </div>
  );
}
