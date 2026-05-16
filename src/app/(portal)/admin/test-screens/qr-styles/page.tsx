import { BadgeCheck, Coffee, Crown, Dumbbell, Film, Heart, Lock, QrCode, Shield, Sparkles, Star, Trophy, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConceptPageShell } from "../concept-components";
import { cn } from "@/lib/utils";

const styles = [
  { title: "Classic", status: "Ready", icon: QrCode, unlocked: true, className: "bg-white text-black" },
  { title: "Coffee", status: "Category themed", icon: Coffee, unlocked: true, className: "bg-amber-200 text-amber-950" },
  { title: "Fitness", status: "Unlock by routes", icon: Dumbbell, unlocked: false, className: "bg-emerald-200 text-emerald-950" },
  { title: "Foodie", status: "Event reward", icon: UtensilsCrossed, unlocked: false, className: "bg-rose-200 text-rose-950" },
  { title: "Cinema", status: "Season drop", icon: Film, unlocked: false, className: "bg-indigo-200 text-indigo-950" },
  { title: "Founder", status: "Limited", icon: Crown, unlocked: true, className: "bg-slate-950 text-white border border-amber-200/40" },
];

const statuses = [
  ["Starter", "Default profile title", Star],
  ["Explorer", "Open 10 partner cards", Trophy],
  ["Curator", "Save 8 places", Heart],
  ["Trusted Scout", "Helpful feedback", Shield],
];

export default function QrStylesConceptPage() {
  return (
    <ConceptPageShell
      eyebrow="Cosmetic progression"
      title="Progressive QR styles и статусы"
      description="Лёгкая геймификация без денег: пользователь открывает стили QR, рамки и статусы за активность, категории, маршруты и полезные действия."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {styles.map((style) => {
          const Icon = style.icon;
          return (
            <div key={style.title} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><h2 className="font-semibold">{style.title}</h2><p className="text-sm text-muted-foreground">{style.status}</p></div>
                {style.unlocked ? <BadgeCheck className="h-5 w-5 text-emerald-200" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className={cn("mx-auto flex h-40 w-40 items-center justify-center rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.35)]", style.className)}>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => <span key={i} className={cn("h-6 w-6 rounded-md", i % 2 === 0 ? "bg-current" : "bg-current/25")} />)}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm"><Icon className="h-4 w-4" /> {style.unlocked ? "Available" : "Locked preview"}</div>
            </div>
          );
        })}
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Profile statuses</h2></div>
        <div className="grid gap-3 md:grid-cols-4">
          {statuses.map(([title, detail, Icon]) => {
            const Glyph = Icon as typeof Star;
            return (
              <div key={title as string} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <Glyph className="mb-3 h-6 w-6 text-primary" />
                <p className="font-semibold">{title as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </ConceptPageShell>
  );
}
