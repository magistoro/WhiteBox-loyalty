import Link from "next/link";
import type React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ConceptItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
  imageLabel?: string;
};

export function ConceptPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Link href="/admin/test-screens" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to test screens
      </Link>
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_88%_0%,rgba(34,211,238,0.16),transparent_34%)]" />
        <div className="relative max-w-4xl">
          <Badge className="mb-4 bg-white text-black">{eyebrow}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 md:text-base">{description}</p>
        </div>
      </section>
      {children}
    </div>
  );
}

export function ConceptGrid({ items }: { items: ConceptItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="glass overflow-hidden border-white/10 bg-slate-950/55 py-0">
            <CardContent className="p-4">
              <div className={cn("mb-4 flex h-36 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.03]", item.accent)}>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-white/15 bg-black/30 text-white shadow-[0_18px_44px_rgba(0,0,0,0.35)]">
                  <Icon className="h-9 w-9" />
                  <span className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">{item.imageLabel ?? "mock"}</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ConceptLinkCard({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="group block">
      <Card className="glass h-full overflow-hidden border-white/10 bg-slate-950/45 py-0 transition-colors group-hover:border-primary/35">
        <CardContent className="flex h-full items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
