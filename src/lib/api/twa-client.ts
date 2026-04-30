import { getAccessToken } from "./auth-client";
import type { ApiCategory } from "./categories-client";

export type TwaCompanyLevel = {
  current: {
    id: number;
    levelName: string;
    minTotalSpend: number;
    cashbackPercent: number;
    sortOrder: number;
  } | null;
  next: {
    id: number;
    levelName: string;
    minTotalSpend: number;
    cashbackPercent: number;
    sortOrder: number;
    pointsToNext: number;
  } | null;
  totalSpentPoints: number;
  progressPercent: number;
  ladder: Array<{
    id: number;
    levelName: string;
    minTotalSpend: number;
    cashbackPercent: number;
    sortOrder: number;
  }>;
};

export type TwaCompany = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  category: ApiCategory;
  categories: ApiCategory[];
  locations: Array<{
    uuid: string;
    title: string | null;
    address: string;
    city: string | null;
    latitude: number;
    longitude: number;
    precision: string | null;
    openTime: string;
    closeTime: string;
    workingDays: number[];
    isMain: boolean;
  }>;
  points: {
    balance: number;
    totalEarnedPoints: number;
    totalSpentPoints: number;
    pointsToNextReward: number | null;
    expiringPoints: number | null;
    expiringDate: string | null;
    updatedAt: string | null;
  };
  level: TwaCompanyLevel;
};

export type TwaSubscriptionPlan = {
  uuid: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  renewalPeriod: string;
  renewalValue: number;
  renewalUnit: string;
  promoBonusDays: number;
  promoEndsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: number; slug: string; name: string; isActive: boolean } | null;
  category: ApiCategory | null;
  isOwned?: boolean;
};

export type TwaUserSubscription = {
  id: number;
  status: "ACTIVE" | "EXPIRED" | "CANCELED";
  activatedAt: string;
  expiresAt: string | null;
  willAutoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  subscription: TwaSubscriptionPlan;
};

export type TwaHistory = {
  transactions: Array<{
    uuid: string;
    type: "EARN" | "SPEND";
    status: "ACTIVE" | "EXPIRED";
    amount: number;
    description: string | null;
    occurredAt: string;
    company: {
      id: number;
      slug: string;
      name: string;
      category: ApiCategory;
    };
  }>;
  archivedSubscriptions: TwaUserSubscription[];
};

export type TwaMarketplace = {
  categories: ApiCategory[];
  subscriptions: TwaSubscriptionPlan[];
};

export type TwaWallet = {
  totalBalance: number;
  companies: TwaCompany[];
};

export type TwaDashboard = {
  wallet: TwaWallet;
  activeSubscriptions: TwaUserSubscription[];
  recommendedSubscriptions: TwaSubscriptionPlan[];
  favoriteCategories: ApiCategory[];
};

export type TwaQr = {
  payload: string;
  generatedAt: string;
};

export type TwaProfile = {
  user: {
    uuid: string;
    name: string;
    email: string;
    createdAt: string;
  };
  preferences: {
    onboardingCompletedAt: string | null;
    onboardingSkippedAt: string | null;
    geolocationPromptedAt: string | null;
    profileVisibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
    marketingOptIn: boolean;
    showActivityStats: boolean;
  };
  stats: {
    totalBalance: number;
    partnerCount: number;
    activeSubscriptions: number;
    favoriteCategories: number;
    activityScore: number;
  };
  favoriteCategories: ApiCategory[];
  referral: {
    code: string;
    title: string;
    inviterBonusPoints: number;
    invitedBonusPoints: number;
    isActive: boolean;
  };
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  return base.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function postJson<T>(path: string, body: unknown, fallbackMessage: string) {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      return { ok: false as const, message: message ?? fallbackMessage };
    }
    return { ok: true as const, data: (await res.json()) as T };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : fallbackMessage };
  }
}

async function putJson<T>(path: string, body: unknown, fallbackMessage: string) {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      return { ok: false as const, message: message ?? fallbackMessage };
    }
    return { ok: true as const, data: (await res.json()) as T };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : fallbackMessage };
  }
}

export function getTwaDashboard() {
  return getJson<TwaDashboard>("/registered/dashboard", {
    wallet: { totalBalance: 0, companies: [] },
    activeSubscriptions: [],
    recommendedSubscriptions: [],
    favoriteCategories: [],
  });
}

export function getTwaMarketplace(categorySlug?: string) {
  const suffix = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
  return getJson<TwaMarketplace>(`/registered/marketplace${suffix}`, {
    categories: [],
    subscriptions: [],
  });
}

export function getTwaCompanies() {
  return getJson<TwaCompany[]>("/registered/companies", []);
}

export function getTwaWallet() {
  return getJson<TwaWallet>("/registered/wallet", {
    totalBalance: 0,
    companies: [],
  });
}

export function getTwaQr() {
  return getJson<TwaQr>("/registered/qr", {
    payload: "",
    generatedAt: "",
  });
}

export function getTwaProfile() {
  return getJson<TwaProfile>("/registered/profile", {
    user: { uuid: "", name: "", email: "", createdAt: "" },
    preferences: {
      onboardingCompletedAt: null,
      onboardingSkippedAt: null,
      geolocationPromptedAt: null,
      profileVisibility: "PRIVATE",
      marketingOptIn: false,
      showActivityStats: true,
    },
    stats: {
      totalBalance: 0,
      partnerCount: 0,
      activeSubscriptions: 0,
      favoriteCategories: 0,
      activityScore: 0,
    },
    favoriteCategories: [],
    referral: {
      code: "",
      title: "Invite a friend",
      inviterBonusPoints: 0,
      invitedBonusPoints: 0,
      isActive: false,
    },
  });
}

export function getTwaHistory() {
  return getJson<TwaHistory>("/registered/history", {
    transactions: [],
    archivedSubscriptions: [],
  });
}

export function getActiveTwaSubscriptions() {
  return getJson<TwaUserSubscription[]>("/registered/subscriptions/active", []);
}

export function getArchivedTwaSubscriptions() {
  return getJson<TwaUserSubscription[]>("/registered/subscriptions/archive", []);
}

export async function activateTwaSubscription(uuid: string) {
  const res = await fetch(`${apiBase()}/registered/subscriptions/${uuid}/activate`, {
    method: "POST",
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Failed";
    return { ok: false as const, message };
  }
  return { ok: true as const, data: (await res.json()) as TwaUserSubscription };
}

export function completeTwaOnboarding() {
  return postJson<{ success: true }>("/registered/onboarding/complete", {}, "Failed to complete onboarding");
}

export function skipTwaOnboarding() {
  return postJson<{ success: true }>("/registered/onboarding/skip", {}, "Failed to skip onboarding");
}

export function updateTwaProfilePreferences(input: {
  profileVisibility?: "PRIVATE" | "FRIENDS" | "PUBLIC";
  marketingOptIn?: boolean;
  showActivityStats?: boolean;
}) {
  return putJson<TwaProfile["preferences"]>("/registered/profile/preferences", input, "Failed to update preferences");
}

export function redeemTwaPromoCode(code: string) {
  return postJson<{ type: "POINTS" | "SUBSCRIPTION"; message: string }>("/registered/promo/redeem", { code }, "Failed to redeem promo code");
}

export function getTwaReferral() {
  return getJson<TwaProfile["referral"]>("/registered/referral", {
    code: "",
    title: "Invite a friend",
    inviterBonusPoints: 0,
    invitedBonusPoints: 0,
    isActive: false,
  });
}

export function redeemTwaReferralCode(code: string) {
  return postJson<{ success: true; message: string }>("/registered/referral/redeem", { code }, "Failed to redeem referral code");
}
