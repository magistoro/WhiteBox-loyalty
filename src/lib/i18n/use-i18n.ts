"use client";

import { useCallback, useEffect, useState } from "react";
import { persistLocale, readClientLocale } from "./client";
import { translate, type TranslationKey } from "./dictionary";
import { isLocale, type Locale } from "./shared";

export function useI18n(fallback: Locale = "en") {
  const [locale, setLocaleState] = useState<Locale>(fallback);

  useEffect(() => {
    setLocaleState(readClientLocale(fallback));

    let active = true;
    fetch("/api/i18n/locale", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { locale?: unknown }) => {
        if (active && isLocale(data.locale)) setLocaleState(data.locale);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [fallback]);

  const setLocale = useCallback(async (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    await persistLocale(nextLocale);
  }, []);

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);

  return { locale, setLocale, t };
}
