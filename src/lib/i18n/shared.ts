export const LOCALE_COOKIE = "wb_locale";
export const SUPPORTED_LOCALES = ["ru", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const RUSSIAN_COUNTRIES = new Set(["RU", "BY", "KZ", "KG", "AM", "MD"]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: unknown): Locale | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().slice(0, 2);
  return isLocale(normalized) ? normalized : null;
}

export function detectLocaleFromCountry(countryCode: string | null | undefined): Locale | null {
  if (!countryCode) return null;
  return RUSSIAN_COUNTRIES.has(countryCode.trim().toUpperCase()) ? "ru" : "en";
}

export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const weighted = header
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      const locale = normalizeLocale(tag);
      const q = quality ? Number(quality) : 1;
      return locale && Number.isFinite(q) ? { locale, q } : null;
    })
    .filter(Boolean) as Array<{ locale: Locale; q: number }>;

  weighted.sort((a, b) => b.q - a.q);
  return weighted[0]?.locale ?? null;
}

export function detectPreferredLocale(input: {
  cookieLocale?: string | null;
  countryCode?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return (
    normalizeLocale(input.cookieLocale) ??
    detectLocaleFromCountry(input.countryCode) ??
    detectLocaleFromAcceptLanguage(input.acceptLanguage) ??
    "en"
  );
}
