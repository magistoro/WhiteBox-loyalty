"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminCreateCompanySubscription,
  adminDeleteCompanySubscription,
  adminDeleteCompanyUser,
  adminGetCompanyUser,
  adminListCategories,
  adminUpdateCompanySubscription,
  adminUpdateCompanyUser,
  adminUpsertCompanyProfile,
  type AdminCategory,
  type AdminCompanySubscription,
} from "@/lib/api/admin-client";

type CompanyForm = {
  name: string;
  accountStatus: "ACTIVE" | "FROZEN_PENDING_DELETION";
  emailVerifiedAt: string;
  createdAt: string;
};

type CompanyProfileForm = {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  pointsPerReward: number;
  isActive: boolean;
};

type SubscriptionDraft = {
  name: string;
  description: string;
  price: string;
  renewalPeriod: string;
  slug: string;
  categoryId: number | "";
};

function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrNull(local: string) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminCompanyProfilePage() {
  const params = useParams<{ uuid: string }>();
  const companyUserUuid = params.uuid;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [accountForm, setAccountForm] = useState<CompanyForm | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyProfileForm | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminCompanySubscription[]>([]);
  const [draft, setDraft] = useState<SubscriptionDraft>({
    name: "",
    description: "",
    price: "",
    renewalPeriod: "month",
    slug: "",
    categoryId: "",
  });

  async function load() {
    setLoading(true);
    const [userRes, cats] = await Promise.all([
      adminGetCompanyUser(companyUserUuid),
      adminListCategories(),
    ]);
    setCategories(cats);
    if (!userRes.ok) {
      setError(`Cannot load company user (${userRes.status}): ${userRes.message}`);
      setLoading(false);
      return;
    }
    const user = userRes.data;
    setAccountForm({
      name: user.name,
      accountStatus: user.accountStatus,
      emailVerifiedAt: toDateTimeLocal(user.emailVerifiedAt),
      createdAt: toDateTimeLocal(user.createdAt),
    });
    setCompanyForm({
      name: user.managedCompany?.name ?? "",
      slug: user.managedCompany?.slug ?? "",
      description: user.managedCompany?.description ?? "",
      categoryId: user.managedCompany?.categoryId ?? cats[0]?.id ?? 1,
      pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
      isActive: user.managedCompany?.isActive ?? true,
    });
    setSubscriptions(user.managedCompany?.subscriptions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const [userRes, cats] = await Promise.all([
        adminGetCompanyUser(companyUserUuid),
        adminListCategories(),
      ]);
      if (ignore) return;
      setCategories(cats);
      if (!userRes.ok) {
        setError(`Cannot load company user (${userRes.status}): ${userRes.message}`);
        setLoading(false);
        return;
      }
      const user = userRes.data;
      setAccountForm({
        name: user.name,
        accountStatus: user.accountStatus,
        emailVerifiedAt: toDateTimeLocal(user.emailVerifiedAt),
        createdAt: toDateTimeLocal(user.createdAt),
      });
      setCompanyForm({
        name: user.managedCompany?.name ?? "",
        slug: user.managedCompany?.slug ?? "",
        description: user.managedCompany?.description ?? "",
        categoryId: user.managedCompany?.categoryId ?? cats[0]?.id ?? 1,
        pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
        isActive: user.managedCompany?.isActive ?? true,
      });
      setSubscriptions(user.managedCompany?.subscriptions ?? []);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [companyUserUuid]);

  async function saveAccount() {
    if (!accountForm) return;
    const res = await adminUpdateCompanyUser(companyUserUuid, {
      name: accountForm.name,
      accountStatus: accountForm.accountStatus,
      emailVerifiedAt: toIsoOrNull(accountForm.emailVerifiedAt),
      createdAt: toIsoOrNull(accountForm.createdAt),
    });
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setNotice("Company user account updated.");
    setError(null);
    await load();
  }

  async function saveCompanyProfile() {
    if (!companyForm) return;
    const res = await adminUpsertCompanyProfile(companyUserUuid, {
      name: companyForm.name,
      slug: companyForm.slug,
      description: companyForm.description || undefined,
      categoryId: Number(companyForm.categoryId),
      pointsPerReward: Number(companyForm.pointsPerReward),
      isActive: companyForm.isActive,
    });
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setNotice("Company profile saved.");
    setError(null);
    await load();
  }

  async function createSubscription() {
    const res = await adminCreateCompanySubscription(companyUserUuid, {
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      renewalPeriod: draft.renewalPeriod,
      slug: draft.slug || undefined,
      categoryId: draft.categoryId === "" ? undefined : Number(draft.categoryId),
    });
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setDraft({
      name: "",
      description: "",
      price: "",
      renewalPeriod: "month",
      slug: "",
      categoryId: "",
    });
    setError(null);
    setNotice("Subscription created.");
    await load();
  }

  async function saveSubscription(sub: AdminCompanySubscription) {
    const res = await adminUpdateCompanySubscription(companyUserUuid, sub.uuid, {
      name: sub.name,
      description: sub.description,
      price: Number(sub.price),
      renewalPeriod: sub.renewalPeriod,
      slug: sub.slug,
      isActive: sub.isActive,
      categoryId: sub.categoryId ?? undefined,
    });
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setError(null);
    setNotice("Subscription updated.");
    await load();
  }

  async function removeSubscription(uuid: string) {
    const res = await adminDeleteCompanySubscription(companyUserUuid, uuid);
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    setError(null);
    setNotice("Subscription deleted.");
    await load();
  }

  async function removeCompanyUser() {
    const check = window.prompt('Type "DELETE" to remove company account');
    if (check !== "DELETE") return;
    const res = await adminDeleteCompanyUser(companyUserUuid);
    if (!res.ok) {
      setError(String(res.message));
      return;
    }
    window.location.href = "/admin/companies";
  }

  if (loading || !accountForm || !companyForm) {
    return <p className="text-sm text-muted-foreground">Loading company profile...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/companies">
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </Link>
        </Button>
        <Button variant="destructive" onClick={() => void removeCompanyUser()}>
          <Trash2 className="h-4 w-4" />
          Delete company user
        </Button>
      </div>

      <Card className="glass border-white/10">
        <CardHeader><CardTitle className="text-base">Company user account</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input value={accountForm.name} onChange={(e) => setAccountForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          <Input value={accountForm.accountStatus} onChange={(e) => setAccountForm((p) => (p ? { ...p, accountStatus: e.target.value as CompanyForm["accountStatus"] } : p))} />
          <Input type="datetime-local" value={accountForm.emailVerifiedAt} onChange={(e) => setAccountForm((p) => (p ? { ...p, emailVerifiedAt: e.target.value } : p))} />
          <Input type="datetime-local" value={accountForm.createdAt} onChange={(e) => setAccountForm((p) => (p ? { ...p, createdAt: e.target.value } : p))} />
          <Button onClick={() => void saveAccount()} className="md:col-span-2 xl:col-span-1">
            <Save className="h-4 w-4" /> Save account
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader><CardTitle className="text-base">Company profile</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Company name" value={companyForm.name} onChange={(e) => setCompanyForm((p) => (p ? { ...p, name: e.target.value } : p))} />
          <Input placeholder="Slug" value={companyForm.slug} onChange={(e) => setCompanyForm((p) => (p ? { ...p, slug: e.target.value } : p))} />
          <Input placeholder="Description" value={companyForm.description} onChange={(e) => setCompanyForm((p) => (p ? { ...p, description: e.target.value } : p))} />
          <Input type="number" placeholder="Points per reward" value={companyForm.pointsPerReward} onChange={(e) => setCompanyForm((p) => (p ? { ...p, pointsPerReward: Number(e.target.value) } : p))} />
          <select
            className="h-9 rounded-md border border-white/10 bg-background px-3 text-sm"
            value={companyForm.categoryId}
            onChange={(e) => setCompanyForm((p) => (p ? { ...p, categoryId: Number(e.target.value) } : p))}
          >
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <Button onClick={() => setCompanyForm((p) => (p ? { ...p, isActive: !p.isActive } : p))} variant="secondary">
            {companyForm.isActive ? "Set inactive" : "Set active"}
          </Button>
          <Button onClick={() => void saveCompanyProfile()}>
            <Save className="h-4 w-4" /> Save company
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-white/10">
        <CardHeader><CardTitle className="text-base">Subscriptions CRUD (company required)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
            <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
            <Input placeholder="Price" type="number" value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} />
            <Input placeholder="Renewal period" value={draft.renewalPeriod} onChange={(e) => setDraft((p) => ({ ...p, renewalPeriod: e.target.value }))} />
            <Input placeholder="Slug (optional)" value={draft.slug} onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))} />
            <Button onClick={() => void createSubscription()} disabled={!draft.name || !draft.description || !draft.price}>
              Create subscription
            </Button>
          </div>

          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div key={sub.uuid} className="rounded-xl border border-white/10 bg-muted/10 p-3">
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
                  <Input value={sub.name} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, name: e.target.value } : p))} />
                  <Input value={sub.description} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, description: e.target.value } : p))} />
                  <Input type="number" value={sub.price} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, price: e.target.value } : p))} />
                  <Input value={sub.renewalPeriod} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, renewalPeriod: e.target.value } : p))} />
                  <Input value={sub.slug} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, slug: e.target.value } : p))} />
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void saveSubscription(sub)}>Save</Button>
                    <Button variant="destructive" onClick={() => void removeSubscription(sub.uuid)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(error || notice) && (
        <Card className="glass border-white/10">
          <CardContent className="py-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-emerald-300">{notice}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
