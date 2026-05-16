import {
  detectLocaleFromAcceptLanguage,
  detectLocaleFromCountry,
  detectPreferredLocale,
  normalizeLocale,
} from "./shared";

describe("i18n locale detection", () => {
  it("normalizes supported locales", () => {
    expect(normalizeLocale("ru-RU")).toBe("ru");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("de-DE")).toBeNull();
  });

  it("uses Russian for supported geo countries and English otherwise", () => {
    expect(detectLocaleFromCountry("RU")).toBe("ru");
    expect(detectLocaleFromCountry("kz")).toBe("ru");
    expect(detectLocaleFromCountry("US")).toBe("en");
  });

  it("respects Accept-Language quality order", () => {
    expect(detectLocaleFromAcceptLanguage("en-US,en;q=0.9,ru;q=0.6")).toBe("en");
    expect(detectLocaleFromAcceptLanguage("en;q=0.5,ru-RU;q=0.9")).toBe("ru");
  });

  it("prefers manual cookie over geo and browser language", () => {
    expect(detectPreferredLocale({ cookieLocale: "en", countryCode: "RU", acceptLanguage: "ru-RU" })).toBe("en");
  });
});
