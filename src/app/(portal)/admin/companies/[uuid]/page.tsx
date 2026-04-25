"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Gift,
  Hash,
  FileText,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { CategorySelect } from "@/components/ui/category-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
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
  categoryIds: number[];
  pointsPerReward: number;
  subscriptionSpendPolicy: "EXCLUDE" | "INCLUDE_NO_BONUS" | "INCLUDE_WITH_BONUS";
  levelRules: Array<{
    levelName: string;
    minTotalSpend: number;
    cashbackPercent: number;
  }>;
  isActive: boolean;
};

type SubscriptionDraft = {
  name: string;
  description: string;
  price: string;
  renewalValue: number;
  renewalUnit: "week" | "month" | "year";
  promoBonusDays: number;
  slug: string;
  categoryId: number | "";
};

type SaveOptions = {
  skipReload?: boolean;
  silent?: boolean;
};

const SUBSCRIPTION_POLICY_OPTIONS = [
  {
    key: "EXCLUDE" as const,
    title: "Exclude subscriptions",
    description: "Subscription purchases do not affect level progress and do not grant cashback.",
    badge: "Safe default",
  },
  {
    key: "INCLUDE_NO_BONUS" as const,
    title: "Count spend only",
    description: "Subscription purchases increase level progress, but cashback is not granted.",
    badge: "Balanced",
  },
  {
    key: "INCLUDE_WITH_BONUS" as const,
    title: "Count spend + cashback",
    description: "Subscription purchases affect both level progress and cashback accrual.",
    badge: "Most generous",
  },
];

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

function formatPrice(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("ru-RU").format(n);
}

function normalizeLevelRules(
  rules?: Array<{ levelName: string; minTotalSpend: string | number; cashbackPercent: string | number }>,
) {
  const mapped =
    rules?.map((rule) => ({
      levelName: rule.levelName,
      minTotalSpend: Number(rule.minTotalSpend),
      cashbackPercent: Number(rule.cashbackPercent),
    })) ?? [];

  return mapped.length > 0 ? mapped : [{ levelName: "Bronze", minTotalSpend: 0, cashbackPercent: 0 }];
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
  const [subscriptionQuery, setSubscriptionQuery] = useState("");
  const [sections, setSections] = useState({
    account: true,
    profile: true,
    subscriptions: true,
  });
  const [initialAccountHash, setInitialAccountHash] = useState("");
  const [initialCompanyHash, setInitialCompanyHash] = useState("");
  const [initialSubscriptionsHash, setInitialSubscriptionsHash] = useState("");
  const [initialAccountState, setInitialAccountState] = useState<CompanyForm | null>(null);
  const [initialCompanyState, setInitialCompanyState] = useState<CompanyProfileForm | null>(null);
  const [initialSubscriptionsState, setInitialSubscriptionsState] = useState<
    AdminCompanySubscription[]
  >([]);
  const [draft, setDraft] = useState<SubscriptionDraft>({
    name: "",
    description: "",
    price: "",
    renewalValue: 1,
    renewalUnit: "month",
    promoBonusDays: 0,
    slug: "",
    categoryId: "",
  });

  const filteredSubscriptions = useMemo(() => {
    const q = subscriptionQuery.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((sub) => {
      return (
        sub.name.toLowerCase().includes(q) ||
        sub.description.toLowerCase().includes(q) ||
        sub.slug.toLowerCase().includes(q) ||
        sub.renewalPeriod.toLowerCase().includes(q) ||
        `${sub.renewalValue} ${sub.renewalUnit}`.includes(q)
      );
    });
  }, [subscriptionQuery, subscriptions]);

  const accountHash = useMemo(() => {
    if (!accountForm) return "";
    return JSON.stringify(accountForm);
  }, [accountForm]);

  const companyHash = useMemo(() => {
    if (!companyForm) return "";
    return JSON.stringify(companyForm);
  }, [companyForm]);

  const subscriptionsHash = useMemo(() => {
    return JSON.stringify(
      [...subscriptions]
        .sort((a, b) => a.uuid.localeCompare(b.uuid))
        .map((sub) => ({
          uuid: sub.uuid,
          name: sub.name,
          description: sub.description,
          price: String(sub.price),
          renewalPeriod: sub.renewalPeriod,
          renewalValue: sub.renewalValue,
          renewalUnit: sub.renewalUnit,
          promoBonusDays: sub.promoBonusDays,
          promoEndsAt: sub.promoEndsAt,
          slug: sub.slug,
          categoryId: sub.categoryId,
          isActive: sub.isActive,
        })),
    );
  }, [subscriptions]);

  const accountDirty = Boolean(initialAccountHash && accountHash !== initialAccountHash);
  const companyDirty = Boolean(initialCompanyHash && companyHash !== initialCompanyHash);
  const subscriptionsDirty = Boolean(
    initialSubscriptionsHash && subscriptionsHash !== initialSubscriptionsHash,
  );
  const hasDirty = accountDirty || companyDirty || subscriptionsDirty;

  async function load() {
    setLoading(true);
    const [userRes, cats] = await Promise.all([adminGetCompanyUser(companyUserUuid), adminListCategories()]);
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
      categoryIds:
        user.managedCompany?.categories?.map((row) => row.categoryId) ??
        (user.managedCompany?.categoryId ? [user.managedCompany.categoryId] : []),
      pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
      subscriptionSpendPolicy: user.managedCompany?.subscriptionSpendPolicy ?? "EXCLUDE",
      levelRules: normalizeLevelRules(user.managedCompany?.levelRules),
      isActive: user.managedCompany?.isActive ?? true,
    });
    setSubscriptions(user.managedCompany?.subscriptions ?? []);
    const nextAccount: CompanyForm = {
      name: user.name,
      accountStatus: user.accountStatus,
      emailVerifiedAt: toDateTimeLocal(user.emailVerifiedAt),
      createdAt: toDateTimeLocal(user.createdAt),
    };
    const nextCompany: CompanyProfileForm = {
      name: user.managedCompany?.name ?? "",
      slug: user.managedCompany?.slug ?? "",
      description: user.managedCompany?.description ?? "",
      categoryIds:
        user.managedCompany?.categories?.map((row) => row.categoryId) ??
        (user.managedCompany?.categoryId ? [user.managedCompany.categoryId] : []),
      pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
      subscriptionSpendPolicy: user.managedCompany?.subscriptionSpendPolicy ?? "EXCLUDE",
      levelRules: normalizeLevelRules(user.managedCompany?.levelRules),
      isActive: user.managedCompany?.isActive ?? true,
    };
    const nextSubscriptions = user.managedCompany?.subscriptions ?? [];
    setInitialAccountState(nextAccount);
    setInitialCompanyState(nextCompany);
    setInitialSubscriptionsState(nextSubscriptions);
    setInitialAccountHash(JSON.stringify(nextAccount));
    setInitialCompanyHash(JSON.stringify(nextCompany));
    setInitialSubscriptionsHash(
      JSON.stringify(
        [...nextSubscriptions]
          .sort((a, b) => a.uuid.localeCompare(b.uuid))
          .map((sub) => ({
            uuid: sub.uuid,
            name: sub.name,
            description: sub.description,
            price: String(sub.price),
            renewalPeriod: sub.renewalPeriod,
            renewalValue: sub.renewalValue,
            renewalUnit: sub.renewalUnit,
            promoBonusDays: sub.promoBonusDays,
            promoEndsAt: sub.promoEndsAt,
            slug: sub.slug,
            categoryId: sub.categoryId,
            isActive: sub.isActive,
          })),
      ),
    );
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const [userRes, cats] = await Promise.all([adminGetCompanyUser(companyUserUuid), adminListCategories()]);
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
        categoryIds:
          user.managedCompany?.categories?.map((row) => row.categoryId) ??
          (user.managedCompany?.categoryId ? [user.managedCompany.categoryId] : []),
        pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
        subscriptionSpendPolicy: user.managedCompany?.subscriptionSpendPolicy ?? "EXCLUDE",
        levelRules: normalizeLevelRules(user.managedCompany?.levelRules),
        isActive: user.managedCompany?.isActive ?? true,
      });
      setSubscriptions(user.managedCompany?.subscriptions ?? []);
      const nextAccount: CompanyForm = {
        name: user.name,
        accountStatus: user.accountStatus,
        emailVerifiedAt: toDateTimeLocal(user.emailVerifiedAt),
        createdAt: toDateTimeLocal(user.createdAt),
      };
      const nextCompany: CompanyProfileForm = {
        name: user.managedCompany?.name ?? "",
        slug: user.managedCompany?.slug ?? "",
        description: user.managedCompany?.description ?? "",
        categoryIds:
          user.managedCompany?.categories?.map((row) => row.categoryId) ??
          (user.managedCompany?.categoryId ? [user.managedCompany.categoryId] : []),
        pointsPerReward: user.managedCompany?.pointsPerReward ?? 100,
        subscriptionSpendPolicy: user.managedCompany?.subscriptionSpendPolicy ?? "EXCLUDE",
        levelRules: normalizeLevelRules(user.managedCompany?.levelRules),
        isActive: user.managedCompany?.isActive ?? true,
      };
      const nextSubscriptions = user.managedCompany?.subscriptions ?? [];
      setInitialAccountState(nextAccount);
      setInitialCompanyState(nextCompany);
      setInitialSubscriptionsState(nextSubscriptions);
      setInitialAccountHash(JSON.stringify(nextAccount));
      setInitialCompanyHash(JSON.stringify(nextCompany));
      setInitialSubscriptionsHash(
        JSON.stringify(
          [...nextSubscriptions]
            .sort((a, b) => a.uuid.localeCompare(b.uuid))
            .map((sub) => ({
              uuid: sub.uuid,
              name: sub.name,
              description: sub.description,
              price: String(sub.price),
              renewalPeriod: sub.renewalPeriod,
              renewalValue: sub.renewalValue,
              renewalUnit: sub.renewalUnit,
              promoBonusDays: sub.promoBonusDays,
              promoEndsAt: sub.promoEndsAt,
              slug: sub.slug,
              categoryId: sub.categoryId,
              isActive: sub.isActive,
            })),
        ),
      );
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [companyUserUuid]);

  async function saveAccount(options?: SaveOptions) {
    if (!accountForm) return;
    const res = await adminUpdateCompanyUser(companyUserUuid, {
      name: accountForm.name,
      accountStatus: accountForm.accountStatus,
      emailVerifiedAt: toIsoOrNull(accountForm.emailVerifiedAt),
      createdAt: toIsoOrNull(accountForm.createdAt),
    });
    if (!res.ok) {
      setError(String(res.message));
      return false;
    }
    if (!options?.silent) setNotice("Company user account updated.");
    setError(null);
    if (!options?.skipReload) await load();
    return true;
  }

  async function saveCompanyProfile(options?: SaveOptions) {
    if (!companyForm) return;
    const categoryIds = companyForm.categoryIds.filter((id) => Number.isInteger(id) && id > 0);
    if (categoryIds.length === 0) {
      setError("Select at least one company category.");
      return false;
    }
    const sortedLevelRules = [...companyForm.levelRules].sort(
      (a, b) => Number(a.minTotalSpend) - Number(b.minTotalSpend),
    );
    for (let i = 1; i < sortedLevelRules.length; i += 1) {
      if (Number(sortedLevelRules[i].cashbackPercent) < Number(sortedLevelRules[i - 1].cashbackPercent)) {
        setError(
          "Cashback percent cannot be higher on lower levels. Keep cashback increasing by level.",
        );
        return false;
      }
    }
    const res = await adminUpsertCompanyProfile(companyUserUuid, {
      name: companyForm.name,
      slug: companyForm.slug,
      description: companyForm.description || undefined,
      categoryId: categoryIds[0],
      categoryIds,
      pointsPerReward: Math.max(1, Number(companyForm.pointsPerReward || 1)),
      subscriptionSpendPolicy: companyForm.subscriptionSpendPolicy,
      levelRules: companyForm.levelRules.map((rule) => ({
        levelName: rule.levelName.trim() || "Level",
        minTotalSpend: Number(rule.minTotalSpend || 0),
        cashbackPercent: Number(rule.cashbackPercent || 0),
      })),
      isActive: companyForm.isActive,
    });
    if (!res.ok) {
      setError(String(res.message));
      return false;
    }
    if (!options?.silent) setNotice("Company profile saved.");
    setError(null);
    if (!options?.skipReload) await load();
    return true;
  }

  async function createSubscription() {
    const res = await adminCreateCompanySubscription(companyUserUuid, {
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      renewalValue: Number(draft.renewalValue),
      renewalUnit: draft.renewalUnit,
      promoBonusDays: Number(draft.promoBonusDays || 0),
      promoEndsAt: null,
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
      renewalValue: 1,
      renewalUnit: "month",
      promoBonusDays: 0,
      slug: "",
      categoryId: "",
    });
    setError(null);
    setNotice("Subscription created.");
    await load();
  }

  async function saveSubscription(sub: AdminCompanySubscription, options?: SaveOptions) {
    const res = await adminUpdateCompanySubscription(companyUserUuid, sub.uuid, {
      name: sub.name,
      description: sub.description,
      price: Number(sub.price),
      renewalValue: sub.renewalValue,
      renewalUnit: sub.renewalUnit,
      promoBonusDays: sub.promoBonusDays,
      promoEndsAt: sub.promoEndsAt,
      slug: sub.slug,
      isActive: sub.isActive,
      categoryId: sub.categoryId ?? undefined,
    });
    if (!res.ok) {
      setError(String(res.message));
      return false;
    }
    setError(null);
    if (!options?.silent) setNotice("Subscription updated.");
    if (!options?.skipReload) await load();
    return true;
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

  async function discardAllChanges() {
    if (initialAccountState) {
      setAccountForm({ ...initialAccountState });
      setInitialAccountHash(JSON.stringify(initialAccountState));
    }
    if (initialCompanyState) {
      setCompanyForm({
        ...initialCompanyState,
        categoryIds: [...initialCompanyState.categoryIds],
        levelRules: initialCompanyState.levelRules.map((rule) => ({ ...rule })),
      });
      setInitialCompanyHash(JSON.stringify(initialCompanyState));
    }
    setSubscriptions(initialSubscriptionsState.map((sub) => ({ ...sub })));
    setInitialSubscriptionsHash(
      JSON.stringify(
        [...initialSubscriptionsState]
          .sort((a, b) => a.uuid.localeCompare(b.uuid))
          .map((sub) => ({
            uuid: sub.uuid,
            name: sub.name,
            description: sub.description,
            price: String(sub.price),
            renewalPeriod: sub.renewalPeriod,
            renewalValue: sub.renewalValue,
            renewalUnit: sub.renewalUnit,
            promoBonusDays: sub.promoBonusDays,
            promoEndsAt: sub.promoEndsAt,
            slug: sub.slug,
            categoryId: sub.categoryId,
            isActive: sub.isActive,
          })),
      ),
    );
    setNotice("All local edits discarded.");
    setError(null);
  }

  async function saveAllChanges() {
    const changedSubscriptions = [...subscriptions]
      .sort((a, b) => a.uuid.localeCompare(b.uuid))
      .filter((sub, index) => {
        const baselineParsed = initialSubscriptionsHash ? (JSON.parse(initialSubscriptionsHash) as Array<{
          uuid: string;
          name: string;
          description: string;
          price: string;
          renewalPeriod: string;
          renewalValue: number;
          renewalUnit: "week" | "month" | "year";
          promoBonusDays: number;
          promoEndsAt: string | null;
          slug: string;
          categoryId: number | null;
          isActive: boolean;
        }>) : [];
        const baseline = baselineParsed[index];
        if (!baseline || baseline.uuid !== sub.uuid) return true;
        return JSON.stringify({
          uuid: sub.uuid,
          name: sub.name,
          description: sub.description,
          price: String(sub.price),
          renewalPeriod: sub.renewalPeriod,
          renewalValue: sub.renewalValue,
          renewalUnit: sub.renewalUnit,
          promoBonusDays: sub.promoBonusDays,
          promoEndsAt: sub.promoEndsAt,
          slug: sub.slug,
          categoryId: sub.categoryId,
          isActive: sub.isActive,
        }) !== JSON.stringify(baseline);
      });

    setError(null);
    setNotice(null);

    if (accountDirty) {
      const ok = await saveAccount({ skipReload: true, silent: true });
      if (!ok) return;
    }
    if (companyDirty) {
      const ok = await saveCompanyProfile({ skipReload: true, silent: true });
      if (!ok) return;
    }
    if (subscriptionsDirty) {
      for (const sub of changedSubscriptions) {
        const ok = await saveSubscription(sub, { skipReload: true, silent: true });
        if (!ok) return;
      }
    }

    await load();
    setNotice("All changes saved.");
  }

  if (loading || !accountForm || !companyForm) {
    return <p className="text-sm text-muted-foreground">Loading company profile...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href="/admin/companies">
              <ArrowLeft className="h-4 w-4" />
              Back to companies
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Company workspace</h1>
            <Badge variant={companyForm.isActive ? "default" : "secondary"}>
              {companyForm.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <Badge variant="outline">UUID: {companyUserUuid.slice(0, 8)}...</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href={`/admin/companies/${companyUserUuid}/clients`}>
              <Users className="h-4 w-4" />
              Company clients
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => void removeCompanyUser()}>
            <Trash2 className="h-4 w-4" />
            Delete company user
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="glass border-white/10 gap-3 py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Company profile</p>
              <p className="text-sm font-semibold">{companyForm.name || "Not set"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 gap-3 py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Min redeem</p>
              <p className="text-sm font-semibold">{formatPrice(companyForm.pointsPerReward)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 gap-3 py-3">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subscriptions</p>
              <p className="text-sm font-semibold">{subscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Pro tip: draft all edits first, then use <span className="font-medium text-foreground">Save all</span> in the sticky bar for one clean update.
      </div>

      <Card className="glass border-white/10 gap-3 py-4">
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Company user account</CardTitle>
              <p className="text-xs text-muted-foreground">Identity and account lifecycle fields.</p>
            </div>
            <div className="flex items-center gap-2">
              {accountDirty && <Badge variant="outline">Unsaved</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSections((p) => ({ ...p, account: !p.account }))}
              >
                {sections.account ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {sections.account && <CardContent className="space-y-3 pb-4 pt-0">
          <div className="rounded-xl border border-white/10 bg-muted/10 p-3.5 md:p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="acc-name">Display name</Label>
              <Input
                id="acc-name"
                value={accountForm.name}
                onChange={(e) => setAccountForm((p) => (p ? { ...p, name: e.target.value } : p))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-status" className="inline-flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                Account status
              </Label>
              <SelectField
                id="acc-status"
                value={accountForm.accountStatus}
                onChange={(e) =>
                  setAccountForm((p) => (p ? { ...p, accountStatus: e.target.value as CompanyForm["accountStatus"] } : p))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="FROZEN_PENDING_DELETION">FROZEN_PENDING_DELETION</option>
              </SelectField>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-email-verified">Email verified at</Label>
              <Input
                id="acc-email-verified"
                type="datetime-local"
                value={accountForm.emailVerifiedAt}
                onChange={(e) => setAccountForm((p) => (p ? { ...p, emailVerifiedAt: e.target.value } : p))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-created-at">Created at</Label>
              <Input
                id="acc-created-at"
                type="datetime-local"
                value={accountForm.createdAt}
                onChange={(e) => setAccountForm((p) => (p ? { ...p, createdAt: e.target.value } : p))}
              />
            </div>
            </div>
          </div>
          <Button onClick={() => void saveAccount()}>
            <Save className="h-4 w-4" />
            Save account
          </Button>
        </CardContent>}
      </Card>

      <Card className="glass border-white/10 gap-3 py-4">
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Company profile</CardTitle>
      <p className="text-xs text-muted-foreground">Public brand info and reward settings.</p>
            </div>
            <div className="flex items-center gap-2">
              {companyDirty && <Badge variant="outline">Unsaved</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSections((p) => ({ ...p, profile: !p.profile }))}
              >
                {sections.profile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {sections.profile && <CardContent className="space-y-3 pb-4 pt-0">
          <div className="rounded-xl border border-white/10 bg-muted/10 p-3.5 md:p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                placeholder="Company name"
                value={companyForm.name}
                onChange={(e) => setCompanyForm((p) => (p ? { ...p, name: e.target.value } : p))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-slug">Slug</Label>
              <Input
                id="company-slug"
                placeholder="company-slug"
                value={companyForm.slug}
                onChange={(e) => setCompanyForm((p) => (p ? { ...p, slug: e.target.value } : p))}
              />
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="company-description">Description</Label>
              <Textarea
                id="company-description"
                placeholder="Brief description"
                rows={2}
                className="max-h-48"
                value={companyForm.description}
                onChange={(e) => setCompanyForm((p) => (p ? { ...p, description: e.target.value } : p))}
              />
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="company-category">Categories</Label>
              <CategoryMultiSelect
                id="company-category"
                value={companyForm.categoryIds}
                options={categories}
                onChange={(nextValues) =>
                  setCompanyForm((p) => (p ? { ...p, categoryIds: nextValues } : p))
                }
                placeholder="Select one or more categories"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-points">Min redeem</Label>
              <Input
                id="company-points"
                type="number"
                min={1}
                value={companyForm.pointsPerReward}
                onChange={(e) =>
                  setCompanyForm((p) =>
                    p ? { ...p, pointsPerReward: Math.max(1, Number(e.target.value || 1)) } : p,
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-active">Company status</Label>
              <SelectField
                id="company-active"
                value={companyForm.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setCompanyForm((p) => (p ? { ...p, isActive: e.target.value === "active" } : p))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                Subscription impact mode
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {SUBSCRIPTION_POLICY_OPTIONS.map((opt) => {
                  const isActive = companyForm.subscriptionSpendPolicy === opt.key;
                  return (
                    <Button
                      key={opt.key}
                      type="button"
                      variant={isActive ? "default" : "secondary"}
                      className="h-9 w-full justify-center truncate px-2 text-xs md:text-sm"
                      onClick={() =>
                        setCompanyForm((p) =>
                          p ? { ...p, subscriptionSpendPolicy: opt.key } : p,
                        )
                      }
                    >
                      {opt.title}
                    </Button>
                  );
                })}
              </div>
              <div className="rounded-md border border-white/10 bg-muted/30 px-2.5 py-2 text-xs">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {
                      SUBSCRIPTION_POLICY_OPTIONS.find(
                        (opt) => opt.key === companyForm.subscriptionSpendPolicy,
                      )?.title
                    }
                  </p>
                  <Badge variant="outline">
                    {
                      SUBSCRIPTION_POLICY_OPTIONS.find(
                        (opt) => opt.key === companyForm.subscriptionSpendPolicy,
                      )?.badge
                    }
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {
                    SUBSCRIPTION_POLICY_OPTIONS.find(
                      (opt) => opt.key === companyForm.subscriptionSpendPolicy,
                    )?.description
                  }
                </p>
              </div>
            </div>
            <div className="space-y-2 xl:col-span-4">
              <Label>Loyalty levels</Label>
              <div className="space-y-2 rounded-xl border border-white/10 bg-muted/20 p-3">
                <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground md:grid">
                  <div className="col-span-5">Level name</div>
                  <div className="col-span-3">Min total spend</div>
                  <div className="col-span-2">Cashback %</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                {companyForm.levelRules.map((rule, index) => (
                  <div
                    key={`${index}-${rule.levelName}`}
                    className="grid gap-2 rounded-lg border border-white/10 bg-background/50 p-2.5 md:grid-cols-12"
                  >
                    <div className="space-y-1 md:col-span-5">
                      <Label className="text-xs md:hidden">Level name</Label>
                      <Input
                        placeholder="Level name"
                        value={rule.levelName}
                        onChange={(e) =>
                          setCompanyForm((p) =>
                            p
                              ? {
                                  ...p,
                                  levelRules: p.levelRules.map((r, i) =>
                                    i === index ? { ...r, levelName: e.target.value } : r,
                                  ),
                                }
                              : p,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label className="text-xs md:hidden">Min total spend</Label>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="0"
                        value={rule.minTotalSpend}
                        onFocus={(e) => {
                          if (rule.minTotalSpend === 0) e.currentTarget.select();
                        }}
                        onChange={(e) =>
                          setCompanyForm((p) =>
                            p
                              ? {
                                  ...p,
                                  levelRules: p.levelRules.map((r, i) =>
                                    i === index
                                      ? {
                                          ...r,
                                          minTotalSpend: Math.max(0, Number(e.target.value || 0)),
                                        }
                                      : r,
                                  ),
                                }
                              : p,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs md:hidden">Cashback %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        step="0.1"
                        placeholder="0%"
                        value={rule.cashbackPercent}
                        onFocus={(e) => {
                          if (rule.cashbackPercent === 0) e.currentTarget.select();
                        }}
                        onChange={(e) =>
                          setCompanyForm((p) =>
                            p
                              ? {
                                  ...p,
                                  levelRules: p.levelRules.map((r, i) =>
                                    i === index
                                      ? {
                                          ...r,
                                          cashbackPercent: Math.min(
                                            30,
                                            Math.max(0, Number(e.target.value || 0)),
                                          ),
                                        }
                                      : r,
                                  ),
                                }
                              : p,
                          )
                        }
                      />
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 5, 10].map((preset) => (
                          <Button
                            key={preset}
                            type="button"
                            size="sm"
                            variant={
                              Number(rule.cashbackPercent) === preset ? "default" : "secondary"
                            }
                            className="h-7 px-0 text-xs"
                            onClick={() =>
                              setCompanyForm((p) =>
                                p
                                  ? {
                                      ...p,
                                      levelRules: p.levelRules.map((r, i) =>
                                        i === index ? { ...r, cashbackPercent: preset } : r,
                                      ),
                                    }
                                  : p,
                              )
                            }
                          >
                            {preset}%
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="md:col-span-2"
                      variant="destructive"
                      onClick={() =>
                        setCompanyForm((p) =>
                          p
                            ? {
                                ...p,
                                levelRules:
                                  p.levelRules.length > 1
                                    ? p.levelRules.filter((_, i) => i !== index)
                                    : p.levelRules,
                              }
                            : p,
                        )
                      }
                      disabled={companyForm.levelRules.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCompanyForm((p) =>
                      p
                        ? {
                            ...p,
                            levelRules: [
                              ...p.levelRules,
                              {
                                levelName: `Level ${p.levelRules.length + 1}`,
                                minTotalSpend: 0,
                                cashbackPercent: 0,
                              },
                            ],
                          }
                        : p,
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add level
                </Button>
              </div>
            </div>
            <div className="flex items-end xl:col-span-4">
              <Button onClick={() => void saveCompanyProfile()} className="w-full">
                <Save className="h-4 w-4" />
                Save company profile
              </Button>
            </div>
            </div>
          </div>
        </CardContent>}
      </Card>

      <Card className="glass border-white/10 gap-3 py-4">
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Subscriptions</CardTitle>
              <p className="text-xs text-muted-foreground">Create, search and batch-edit offers for this company.</p>
            </div>
            <div className="flex items-center gap-2">
              {subscriptionsDirty && <Badge variant="outline">Unsaved</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSections((p) => ({ ...p, subscriptions: !p.subscriptions }))}
              >
                {sections.subscriptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {sections.subscriptions && <CardContent className="space-y-4 pb-4 pt-0">
          <div className="rounded-xl border border-white/10 bg-muted/10 p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              <div className="space-y-2 xl:col-span-3">
                <Label htmlFor="sub-draft-name" className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Name
                </Label>
                <Input
                  id="sub-draft-name"
                  placeholder="Premium Coffee Club"
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="sub-draft-price" className="inline-flex items-center gap-1.5">
                  <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                  Price
                </Label>
                <Input
                  id="sub-draft-price"
                  placeholder="100"
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="sub-draft-renewal-value" className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  Period value
                </Label>
                <Input
                  id="sub-draft-renewal-value"
                  type="number"
                  min={1}
                  value={draft.renewalValue}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, renewalValue: Math.max(1, Number(e.target.value || 1)) }))
                  }
                />
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="sub-draft-renewal-unit" className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" />
                  Renewal period
                </Label>
                <SelectField
                  id="sub-draft-renewal-unit"
                  value={draft.renewalUnit}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, renewalUnit: e.target.value as "week" | "month" | "year" }))
                  }
                >
                  <option value="week">week</option>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </SelectField>
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="sub-draft-promo-bonus" className="inline-flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  Bonus days (promo)
                </Label>
                <Input
                  id="sub-draft-promo-bonus"
                  type="number"
                  min={0}
                  value={draft.promoBonusDays}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, promoBonusDays: Math.max(0, Number(e.target.value || 0)) }))
                  }
                />
              </div>
              <div className="space-y-2 xl:col-span-3">
                <Label htmlFor="sub-draft-slug" className="inline-flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  Slug
                </Label>
                <Input
                  id="sub-draft-slug"
                  placeholder="premium-coffee-club"
                  value={draft.slug}
                  onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
                />
              </div>
              <div className="space-y-2 xl:col-span-5">
              <Label htmlFor="sub-draft-category" className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Category
              </Label>
                <CategorySelect
                  id="sub-draft-category"
                  value={draft.categoryId}
                  options={categories}
                  onChange={(nextValue) => setDraft((p) => ({ ...p, categoryId: nextValue }))}
                  emptyLabel="No category"
                />
              </div>
              <div className="space-y-2 xl:col-span-12 xl:mt-1">
                <Label htmlFor="sub-draft-description" className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Description
                </Label>
                <Textarea
                  id="sub-draft-description"
                  placeholder="Describe subscription value in detail..."
                  rows={5}
                  className="min-h-[140px] max-h-80"
                  value={draft.description}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex items-end justify-end xl:col-span-12">
                <Button
                  onClick={() => void createSubscription()}
                  disabled={!draft.name || !draft.description || !draft.price}
                  className="h-11 w-full xl:w-[220px]"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={subscriptionQuery}
              onChange={(e) => setSubscriptionQuery(e.target.value)}
              placeholder="Search subscription by name, description, slug, period..."
              className="pl-9"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </p>

          <div className="space-y-2.5">
            {filteredSubscriptions.map((sub) => (
              <div key={sub.uuid} className="rounded-xl border border-white/10 bg-muted/10 p-3.5">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <p className="text-xs font-medium text-muted-foreground">Subscription #{sub.uuid.slice(0, 8)}</p>
                  <Badge variant={sub.isActive ? "default" : "secondary"}>
                    {sub.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                <div className="mb-2 hidden grid-cols-12 gap-3 px-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground xl:grid">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-1">Price</div>
                  <div className="col-span-1">Period</div>
                  <div className="col-span-2">Renewal</div>
                  <div className="col-span-1">Bonus days</div>
                  <div className="col-span-2">Slug</div>
                  <div className="col-span-3">Category</div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
                  <div className="space-y-1 xl:col-span-2">
                    <Label className="text-xs xl:hidden">Name</Label>
                    <Input value={sub.name} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, name: e.target.value } : p))} />
                  </div>
                  <div className="space-y-1 xl:col-span-1">
                    <Label className="text-xs xl:hidden">Price</Label>
                    <Input type="number" value={sub.price} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, price: e.target.value } : p))} />
                  </div>
                  <div className="space-y-1 xl:col-span-1">
                    <Label className="text-xs xl:hidden">Period value</Label>
                    <Input
                      type="number"
                      min={1}
                      value={sub.renewalValue}
                      onChange={(e) =>
                        setSubscriptions((prev) =>
                          prev.map((p) =>
                            p.uuid === sub.uuid ? { ...p, renewalValue: Math.max(1, Number(e.target.value || 1)) } : p,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1 xl:col-span-2">
                    <Label className="text-xs xl:hidden">Renewal period</Label>
                    <SelectField
                      value={sub.renewalUnit}
                      onChange={(e) =>
                        setSubscriptions((prev) =>
                          prev.map((p) =>
                            p.uuid === sub.uuid
                              ? { ...p, renewalUnit: e.target.value as "week" | "month" | "year" }
                              : p,
                          ),
                        )
                      }
                    >
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </SelectField>
                  </div>
                  <div className="space-y-1 xl:col-span-1">
                    <Label className="text-xs xl:hidden">Bonus days</Label>
                    <Input
                      type="number"
                      min={0}
                      value={sub.promoBonusDays}
                      onChange={(e) =>
                        setSubscriptions((prev) =>
                          prev.map((p) =>
                            p.uuid === sub.uuid
                              ? { ...p, promoBonusDays: Math.max(0, Number(e.target.value || 0)) }
                              : p,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1 xl:col-span-2">
                    <Label className="text-xs xl:hidden">Slug</Label>
                    <Input value={sub.slug} onChange={(e) => setSubscriptions((prev) => prev.map((p) => p.uuid === sub.uuid ? { ...p, slug: e.target.value } : p))} />
                  </div>
                  <div className="space-y-1 xl:col-span-3">
                    <Label className="text-xs xl:hidden">Category</Label>
                    <CategorySelect
                      value={sub.categoryId === null ? "" : sub.categoryId}
                      options={categories}
                      onChange={(nextValue) =>
                        setSubscriptions((prev) =>
                          prev.map((p) =>
                            p.uuid === sub.uuid
                              ? { ...p, categoryId: typeof nextValue === "number" ? nextValue : null }
                              : p,
                          ),
                        )
                      }
                      emptyLabel="No category"
                    />
                  </div>
                  <div className="space-y-1 xl:col-span-9">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={4}
                      className="min-h-[120px] max-h-72"
                      value={sub.description}
                      onChange={(e) =>
                        setSubscriptions((prev) =>
                          prev.map((p) => (p.uuid === sub.uuid ? { ...p, description: e.target.value } : p)),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2 xl:col-span-3 xl:justify-end">
                    <Button variant="secondary" onClick={() => void saveSubscription(sub)} className="flex-1 xl:max-w-[150px]">Save</Button>
                    <Button variant="destructive" onClick={() => void removeSubscription(sub.uuid)} className="flex-1 xl:max-w-[150px]">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSubscriptions.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-muted/10 p-5 text-center text-sm text-muted-foreground">
                No subscriptions match your search.
              </div>
            )}
          </div>
        </CardContent>}
      </Card>

      {(hasDirty || error || notice) && (
        <div className="sticky bottom-3 z-30">
          <Card className="border-primary/30 bg-card/95 shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 py-4">
              <div className="text-sm">
                <p className="font-medium">
                  {hasDirty ? "Unsaved changes detected" : "Status"}
                </p>
                {hasDirty && (
                  <p className="text-xs text-muted-foreground">
                    {accountDirty && "Account "}
                    {companyDirty && "Company profile "}
                    {subscriptionsDirty && "Subscriptions "}
                  </p>
                )}
              </div>
              {(error || notice) && (
                <div className="space-y-1">
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {notice && <p className="text-sm text-emerald-300">{notice}</p>}
                </div>
              )}
              {hasDirty && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => void discardAllChanges()}>
                    <RotateCcw className="h-4 w-4" />
                    Discard
                  </Button>
                  <Button onClick={() => void saveAllChanges()}>
                    <Save className="h-4 w-4" />
                    Save all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

