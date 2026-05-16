"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/use-i18n";

type TelegramStatus = {
  connected: boolean;
  telegramId: string | null;
  email: string;
  name: string;
  role: string;
};

export default function AdminTelegramPage() {
  const { t } = useI18n("ru");
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);

  async function loadStatus() {
    setLoadingStatus(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/telegram/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.message ? `${data.message} (HTTP ${res.status})` : `${t("admin.telegram.checkFailed")} (HTTP ${res.status})`);
        return;
      }
      setStatus(data as TelegramStatus);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("admin.telegram.checkFailed"));
    } finally {
      setLoadingStatus(false);
    }
  }

  async function createLink() {
    setMessage("");
    setCreatingLink(true);
    try {
      const res = await fetch("/api/admin/telegram-link-token", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.message ? `${data.message} (HTTP ${res.status})` : `${t("admin.telegram.createLinkFailed")} (HTTP ${res.status})`);
        return;
      }
      setLink(data.deepLink);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("admin.telegram.createLinkFailed"));
    } finally {
      setCreatingLink(false);
    }
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connected = Boolean(status?.connected);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("admin.telegram.title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("admin.telegram.description")}</p>
        </div>
        <Button variant="secondary" onClick={loadStatus} disabled={loadingStatus}>
          <RefreshCw className="h-4 w-4" /> {t("admin.telegram.refreshStatus")}
        </Button>
      </div>

      <Card className="overflow-hidden border-white/10 bg-card/70">
        <CardHeader className="border-b border-white/10 bg-white/[0.03] px-8 py-6">
          <CardTitle className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              {connected ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Send className="h-5 w-5" />}
            </span>
            {connected ? t("admin.telegram.connectedTitle") : t("admin.telegram.connectTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {loadingStatus ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-muted-foreground">{t("admin.telegram.checking")}</div>
          ) : connected ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.08] p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
                  <div>
                    <p className="text-lg font-semibold text-emerald-50">{t("admin.telegram.connectedSuccess")}</p>
                    <p className="mt-3 text-sm leading-6 text-emerald-50/70">{t("admin.telegram.connectedText")}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("admin.telegram.chatId")}</p>
                <p className="mt-4 break-all text-lg font-semibold">{status?.telegramId}</p>
                <p className="mt-3 text-xs text-muted-foreground">{status?.email}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-muted-foreground">
              {t("admin.telegram.linkHint")}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={createLink} disabled={creatingLink} className="bg-white text-black hover:bg-white/90">
              <ShieldCheck className="h-4 w-4" /> {connected ? t("admin.telegram.reconnect") : t("admin.telegram.createSecureLink")}
            </Button>
            {connected && <p className="text-sm text-muted-foreground">{t("admin.telegram.reconnectHint")}</p>}
          </div>

          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 font-medium text-cyan-100 transition hover:bg-cyan-300/15">
              <span className="truncate">{link}</span>
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          )}
          {message && <div className="rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">{message}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
