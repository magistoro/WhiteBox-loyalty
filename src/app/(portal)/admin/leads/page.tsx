"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellRing, CheckCircle2, Clock3, Inbox, RefreshCw, Search, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListLandingLeads, adminRetryDueLandingLeads, type AdminLandingLead, type AdminLandingLeadStatus } from "@/lib/api/admin-client";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/shared";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";

const statuses: Array<{ value: AdminLandingLeadStatus | "ALL"; labelKey: TranslationKey; icon: typeof Inbox }> = [
  { value: "ALL", labelKey: "admin.common.all", icon: Inbox },
  { value: "NEW", labelKey: "admin.common.new", icon: Sparkles },
  { value: "IN_PROGRESS", labelKey: "admin.common.inProgress", icon: Clock3 },
  { value: "CLOSED", labelKey: "admin.common.closed", icon: CheckCircle2 },
  { value: "SPAM", labelKey: "admin.common.spam", icon: ShieldAlert },
];

function statusClass(status: AdminLandingLeadStatus) {
  if (status === "NEW") return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  if (status === "IN_PROGRESS") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (status === "CLOSED") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  return "border-red-300/30 bg-red-300/10 text-red-100";
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function compactContact(contact: string) {
  const value = contact.trim();
  const emailMatch = value.match(/^([^@\s]{1,16})[^@\s]*(@.+)$/);
  if (emailMatch && value.length > 26) return `${emailMatch[1]}...${emailMatch[2]}`;
  return value;
}

export default function AdminLandingLeadsPage() {
  const { locale, t } = useI18n("ru");
  const [items, setItems] = useState<AdminLandingLead[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminLandingLeadStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const failedDeliveries = useMemo(
    () => items.reduce((sum, lead) => sum + lead.deliveries.filter((delivery) => delivery.status === "FAILED").length, 0),
    [items],
  );

  useEffect(() => {
    let active = true;
    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const result = await adminListLandingLeads({ query, status, page, limit: 12 });
      if (!active) return;
      if (!result.ok) {
        setError(result.message);
        setItems([]);
      } else {
        setItems(result.data.items);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      }
      setLoading(false);
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [query, status, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground">
            <BellRing className="h-4 w-4" /> {t("admin.leads.badge")}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("admin.leads.title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("admin.leads.description")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.common.total")}</p>
            <p className="text-2xl font-semibold">{total}</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.leads.onPage")}</p>
            <p className="text-2xl font-semibold">{items.length}</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted-foreground">{t("admin.leads.failedSends")}</p>
            <p className="text-2xl font-semibold">{failedDeliveries}</p>
          </Card>
        </div>
      </div>

      <Card className="border-white/10 bg-card/70 p-0">
        <CardHeader className="px-8 pb-4 pt-7">
          <CardTitle className="flex items-center gap-2 text-lg"><Search className="h-5 w-5" /> {t("admin.common.searchFilters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-7">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <Input
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder={t("admin.leads.searchPlaceholder")}
            />
            <Button type="button" variant="secondary" onClick={() => setQuery("")}>
              <RefreshCw className="h-4 w-4" /> {t("admin.common.reset")}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={async () => {
              setNotice("");
              const result = await adminRetryDueLandingLeads();
              setNotice(result.ok ? `${t("admin.leads.retryProcessed")}: ${result.data.result.processed} ${t("admin.leads.leads")}.` : result.message);
            }}
          >
            <BellRing className="h-4 w-4" /> {t("admin.leads.retryDue")}
          </Button>
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
                  status === value ? "border-white/30 bg-white text-black" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t(labelKey)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}
      {notice && <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 text-sm text-foreground">{notice}</div>}

      <div className="grid gap-3">
        {loading ? (
          <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">{t("admin.leads.loading")}</Card>
        ) : items.length === 0 ? (
          <Card className="border-white/10 bg-white/[0.04] p-6 text-muted-foreground">{t("admin.leads.empty")}</Card>
        ) : (
          items.map((lead) => (
            <Link key={lead.uuid} href={`/admin/leads/${lead.uuid}`} className="group block">
              <Card className="border-white/10 bg-white/[0.04] p-0 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
                <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_180px_120px_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">{lead.name}</h2>
                      <Badge variant="outline" className={statusClass(lead.status)}>{lead.status}</Badge>
                      {lead.spamScore > 0 && <Badge variant="outline">{t("admin.leads.spamScore")} {lead.spamScore}</Badge>}
                    </div>
                    <p className="mt-1 flex min-w-0 gap-1 text-sm text-muted-foreground">
                      <span className="truncate">{lead.company || t("admin.leads.noCompany")}</span>
                      <span className="shrink-0">·</span>
                      <span title={lead.contact} className="truncate">{compactContact(lead.contact)}</span>
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lead.message}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(lead.createdAt, locale)}</div>
                  <div className="text-sm text-muted-foreground">
                    {lead.deliveries.filter((delivery) => delivery.status === "SENT").length} {t("admin.leads.sent")} · {lead.deliveries.filter((delivery) => delivery.status === "FAILED").length} {t("admin.leads.failed")}
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
