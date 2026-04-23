import { getAccessToken } from "./auth-client";

export type AdminUserRow = {
  uuid: string;
  email: string;
  name: string;
  role: "CLIENT" | "COMPANY" | "ADMIN";
  accountStatus: "ACTIVE" | "FROZEN_PENDING_DELETION";
  createdAt: string;
};

export type AdminCategory = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCompanySubscription = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  renewalPeriod: string;
  isActive: boolean;
  categoryId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCompanyUser = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: "COMPANY";
  accountStatus: "ACTIVE" | "FROZEN_PENDING_DELETION";
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  managedCompany: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    categoryId: number;
    pointsPerReward: number;
    isActive: boolean;
  } | null;
};

export type AdminUserDetail = {
  id: number;
  uuid: string;
  telegramId: string | null;
  name: string;
  email: string;
  role: "CLIENT" | "COMPANY" | "ADMIN";
  accountStatus: "ACTIVE" | "FROZEN_PENDING_DELETION";
  emailVerifiedAt: string | null;
  deletionScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  favoriteCategories: Array<{
    id: number;
    createdAt: string;
    category: {
      id: number;
      slug: string;
      name: string;
      icon: string;
    };
  }>;
  companyLinks: Array<{
    id: number;
    balance: number;
    pointsToNextReward: number | null;
    expiringPoints: number | null;
    expiringDate: string | null;
    createdAt: string;
    updatedAt: string;
    company: {
      slug: string;
      name: string;
      category: {
        slug: string;
        name: string;
      };
    };
  }>;
  subscriptions: Array<{
    id: number;
    status: "ACTIVE" | "EXPIRED" | "CANCELED";
    activatedAt: string;
    expiresAt: string | null;
    willAutoRenew: boolean;
    createdAt: string;
    updatedAt: string;
    subscription: {
      uuid: string;
      slug: string;
      name: string;
      price: string;
      renewalPeriod: string;
      company: { name: string } | null;
      category: { name: string } | null;
    };
  }>;
  refreshTokens: Array<{
    id: string;
    expiresAt: string;
    createdAt: string;
    revokedAt: string | null;
  }>;
  oauthAccounts: Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    scope: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  loginEvents: Array<{
    id: string;
    ipAddress: string | null;
    countryCode: string | null;
    city: string | null;
    userAgent: string | null;
    deviceLabel: string | null;
    createdAt: string;
  }>;
  loginRisk: {
    primaryCountry: string | null;
    latestCountry: string | null;
    unusualCountries: string[];
    shouldReview: boolean;
  };
  loyaltyTransactions: Array<{
    uuid: string;
    type: "EARN" | "SPEND";
    status: "ACTIVE" | "EXPIRED";
    amount: number;
    description: string | null;
    occurredAt: string;
    company: {
      name: string;
      slug: string;
    };
  }>;
};

export type AdminUpdateUserInput = {
  name?: string;
  role?: "CLIENT" | "COMPANY" | "ADMIN";
  accountStatus?: "ACTIVE" | "FROZEN_PENDING_DELETION";
  emailVerifiedAt?: string | null;
  createdAt?: string | null;
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  return base.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const t = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

export async function adminListUsers(role?: string, query?: string): Promise<AdminUserRow[]> {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (query) params.set("query", query);
  const suffix = params.toString() ? `?${params}` : "";
  const res = await fetch(`${apiBase()}/admin/users${suffix}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return (await res.json()) as AdminUserRow[];
}

export async function adminCreateAccount(input: {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "COMPANY" | "ADMIN";
}) {
  const res = await fetch(`${apiBase()}/admin/accounts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to create account" };
  }
  return { ok: true as const };
}

export async function adminGetUser(uuid: string): Promise<
  | { ok: true; data: AdminUserDetail }
  | { ok: false; status: number; message: string }
> {
  const res = await fetch(`${apiBase()}/admin/users/${uuid}`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Request failed";
    return { ok: false, status: res.status, message };
  }
  return { ok: true, data: (await res.json()) as AdminUserDetail };
}

export async function adminUpdateUser(uuid: string, input: AdminUpdateUserInput) {
  const res = await fetch(`${apiBase()}/admin/users/${uuid}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to update user" };
  }
  return { ok: true as const, data: (await res.json()) as AdminUserDetail };
}

export async function adminDeleteUser(uuid: string) {
  const res = await fetch(`${apiBase()}/admin/users/${uuid}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to delete user" };
  }
  return { ok: true as const };
}

export async function adminReactivateUser(uuid: string) {
  const res = await fetch(`${apiBase()}/admin/users/${uuid}/reactivate-account`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to reactivate user" };
  }
  return { ok: true as const, data: (await res.json()) as { uuid: string; accountStatus: string } };
}

export async function adminRequestEmailChange(uuid: string, newEmail: string) {
  const res = await fetch(`${apiBase()}/admin/users/${uuid}/email-change-request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ newEmail }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to send email change link" };
  }
  return {
    ok: true as const,
    data: (await res.json()) as {
      success: true;
      sentTo: string;
      expiresAt: string;
      previewUrl?: string;
    },
  };
}

export async function adminListCategories() {
  const res = await fetch(`${apiBase()}/admin/categories`, { headers: authHeaders() });
  if (!res.ok) return [];
  return (await res.json()) as AdminCategory[];
}

export async function adminCreateCategory(input: {
  slug: string;
  name: string;
  description?: string;
  icon: string;
}) {
  const res = await fetch(`${apiBase()}/admin/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to create category" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCategory };
}

export async function adminUpdateCategory(id: number, input: Partial<Pick<AdminCategory, "slug" | "name" | "description" | "icon">>) {
  const res = await fetch(`${apiBase()}/admin/categories/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to update category" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCategory };
}

export async function adminDeleteCategory(id: number) {
  const res = await fetch(`${apiBase()}/admin/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to delete category" };
  }
  return { ok: true as const };
}

export async function adminListCompanyUsers(query?: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  const suffix = params.toString() ? `?${params}` : "";
  const res = await fetch(`${apiBase()}/admin/company-users${suffix}`, { headers: authHeaders() });
  if (!res.ok) return [];
  return (await res.json()) as AdminCompanyUser[];
}

export async function adminGetCompanyUser(uuid: string) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, status: res.status, message: data.message ?? "Failed" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCompanyUser & { managedCompany: (AdminCompanyUser["managedCompany"] & { subscriptions: AdminCompanySubscription[] }) | null } };
}

export async function adminUpdateCompanyUser(uuid: string, input: {
  name?: string;
  accountStatus?: "ACTIVE" | "FROZEN_PENDING_DELETION";
  emailVerifiedAt?: string | null;
  createdAt?: string | null;
}) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to update company user" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCompanyUser };
}

export async function adminDeleteCompanyUser(uuid: string) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to delete company user" };
  }
  return { ok: true as const };
}

export async function adminUpsertCompanyProfile(uuid: string, input: {
  name: string;
  slug?: string;
  description?: string;
  categoryId: number;
  pointsPerReward?: number;
  isActive?: boolean;
}) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}/company-profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to upsert company profile" };
  }
  return { ok: true as const, data: await res.json() };
}

export async function adminCreateCompanySubscription(uuid: string, input: {
  name: string;
  description: string;
  price: number;
  renewalPeriod: string;
  slug?: string;
  categoryId?: number;
}) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}/subscriptions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to create subscription" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCompanySubscription };
}

export async function adminUpdateCompanySubscription(
  uuid: string,
  subscriptionUuid: string,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    renewalPeriod: string;
    slug: string;
    isActive: boolean;
    categoryId: number;
  }>,
) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}/subscriptions/${subscriptionUuid}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to update subscription" };
  }
  return { ok: true as const, data: (await res.json()) as AdminCompanySubscription };
}

export async function adminDeleteCompanySubscription(uuid: string, subscriptionUuid: string) {
  const res = await fetch(`${apiBase()}/admin/company-users/${uuid}/subscriptions/${subscriptionUuid}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, message: data.message ?? "Failed to delete subscription" };
  }
  return { ok: true as const };
}

export async function adminSubscriptionStats() {
  const res = await fetch(`${apiBase()}/admin/subscriptions/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    total: number;
    active: number;
    expired: number;
    canceled: number;
  };
}

export async function adminFindSubscriptionByUuid(uuid: string) {
  const res = await fetch(`${apiBase()}/admin/subscriptions/${uuid}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    uuid: string;
    name: string;
    slug: string;
    description: string;
  };
}
