"use client";

import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { persistLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  onChange,
  className,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
}) {
  async function choose(nextLocale: Locale) {
    onChange(nextLocale);
    await persistLocale(nextLocale);
  }

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-white/58">
        <Globe2 className="h-4 w-4" />
      </span>
      {(["ru", "en"] as const).map((item) => (
        <Button
          key={item}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => choose(item)}
          className={cn(
            "h-8 rounded-full px-3 text-xs font-semibold",
            locale === item ? "bg-white text-black hover:bg-white/90" : "text-white/58 hover:bg-white/10 hover:text-white",
          )}
        >
          {item.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
