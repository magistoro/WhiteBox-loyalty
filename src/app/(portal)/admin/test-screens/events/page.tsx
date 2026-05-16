import { BadgePercent, CalendarDays, Coffee, Dumbbell, Gift, HeartPulse, MapPinned, Moon, Sparkles, Sun, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConceptGrid, ConceptPageShell } from "../concept-components";

const items = [
  { title: "Coffee Week", description: "+10% points at coffee partners, но бесплатная часть события: открыть 3 кофейные карточки, сохранить любимую, построить маршрут.", icon: Coffee, accent: "from-amber-300/20 to-orange-950/20", imageLabel: "+10%" },
  { title: "Wellness Weekend", description: "Фитнес/здоровье выходные: маршруты до залов, подборка wellness-партнёров, free checklist без покупки.", icon: HeartPulse, accent: "from-emerald-300/15 to-slate-950", imageLabel: "48h" },
  { title: "Lunch Map Hunt", description: "Открыть 5 food-точек рядом с работой или домом. Событие мотивирует исследовать карту, а не тратить деньги.", icon: UtensilsCrossed, accent: "from-rose-300/15 to-slate-950", imageLabel: "hunt" },
  { title: "Night Owl Picks", description: "Подборка открытых поздно мест. Полезное событие с фильтром open-now и маршрутами.", icon: Moon, accent: "from-indigo-300/15 to-slate-950", imageLabel: "open" },
  { title: "Morning Route", description: "Утренний сценарий: кофе, спорт, завтрак. Можно пройти как маршрут или сохранить на потом.", icon: Sun, accent: "from-yellow-300/15 to-slate-950", imageLabel: "AM" },
  { title: "Partner Collab Drop", description: "Временная коллаборация компаний: Coffee x Books, Fitness x Health. Даёт отдельную страницу истории и прогресса.", icon: Gift, accent: "from-cyan-300/15 to-slate-950", imageLabel: "drop" },
];

export default function EventsConceptPage() {
  return (
    <ConceptPageShell
      eyebrow="Timed events"
      title="Временные события"
      description="События дают продукту ритм: неделя кофе, выходные здоровья, карта обедов. Важно: у каждого события есть бесплатный путь через discovery, маршруты и сохранения."
    >
      <ConceptGrid items={items} />
      <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Event page anatomy</h2>
            <p className="text-sm text-muted-foreground">Как устроить событие, чтобы оно не было “купи-купи”.</p>
          </div>
          <Badge className="gap-1 bg-white text-black"><CalendarDays className="h-3 w-3" /> 7 days</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            [MapPinned, "Explore", "Open partner map collection"],
            [Sparkles, "Discover", "Read partner stories"],
            [BadgePercent, "Bonus", "Optional +10% points"],
            [Dumbbell, "Complete", "Finish free checklist"],
          ].map(([Icon, title, text]) => {
            const Glyph = Icon as typeof Coffee;
            return (
              <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Glyph className="mb-3 h-6 w-6 text-primary" />
                <p className="font-semibold">{title as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>
    </ConceptPageShell>
  );
}
