"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { adminCreateAuditEvent } from "@/lib/api/admin-client";

type AuditLevel = "INFO" | "WARN" | "CRITICAL";
type AuditCategory = "SECURITY" | "USER" | "SUBSCRIPTION" | "BILLING" | "SYSTEM";
type AuditWorkspace = "MANAGER" | "DEVELOPER";

export default function AdminAuditCreatePage() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    workspace: "MANAGER" as AuditWorkspace,
    category: "USER" as AuditCategory,
    level: "INFO" as AuditLevel,
    action: "",
    targetLabel: "",
    targetEmail: "",
    targetUuid: "",
    details: "",
    tags: "",
    result: "SUCCESS" as "SUCCESS" | "BLOCKED",
  });

  async function onCreateAudit() {
    setNotice(null);
    setError(null);
    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);
    const res = await adminCreateAuditEvent({
      workspace: form.workspace,
      category: form.category,
      level: form.level,
      action: form.action,
      targetLabel: form.targetLabel || undefined,
      targetEmail: form.targetEmail || undefined,
      targetUuid: form.targetUuid || undefined,
      details: form.details || undefined,
      tags,
      result: form.result,
    });
    setSaving(false);
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setNotice("Audit event added.");
    setForm((prev) => ({ ...prev, action: "", targetLabel: "", targetEmail: "", targetUuid: "", details: "", tags: "" }));
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="secondary" size="sm">
        <Link href="/admin/audit">
          <ArrowLeft className="h-4 w-4" />
          Back to audit log
        </Link>
      </Button>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 text-primary" />
            Add audit event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <SelectField value={form.workspace} onChange={(e) => setForm((p) => ({ ...p, workspace: e.target.value as AuditWorkspace }))}>
              <option value="MANAGER">Manager stream</option>
              <option value="DEVELOPER">Developer stream</option>
            </SelectField>
            <SelectField value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as AuditCategory }))}>
              <option value="SECURITY">Security</option>
              <option value="USER">User</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="BILLING">Billing</option>
              <option value="SYSTEM">System</option>
            </SelectField>
            <SelectField value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as AuditLevel }))}>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="CRITICAL">Critical</option>
            </SelectField>
            <SelectField value={form.result} onChange={(e) => setForm((p) => ({ ...p, result: e.target.value as "SUCCESS" | "BLOCKED" }))}>
              <option value="SUCCESS">Success</option>
              <option value="BLOCKED">Blocked</option>
            </SelectField>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Action (required)" value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))} />
            <Input placeholder="Target label" value={form.targetLabel} onChange={(e) => setForm((p) => ({ ...p, targetLabel: e.target.value }))} />
            <Input placeholder="Target email" value={form.targetEmail} onChange={(e) => setForm((p) => ({ ...p, targetEmail: e.target.value }))} />
            <Input placeholder="Target uuid" value={form.targetUuid} onChange={(e) => setForm((p) => ({ ...p, targetUuid: e.target.value }))} />
            <Input className="md:col-span-2" placeholder="Tags (comma-separated), e.g. GIT, SECURITY" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
            <Input className="md:col-span-2" placeholder="Details" value={form.details} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => void onCreateAudit()} disabled={!form.action.trim() || saving}>Create event</Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-emerald-300">{notice}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
