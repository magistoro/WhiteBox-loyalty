import { Award, Eye, Heart, Lock, Map, Medal, QrCode, Route, ShieldCheck, Sparkles, Star, Trophy, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConceptGrid, ConceptPageShell } from "../concept-components";

const items = [
  { title: "First Signal", description: "Открыть QR и понять механику. Это не про деньги, а про готовность пользоваться продуктом.", icon: QrCode, accent: "from-white/15 to-slate-950" },
  { title: "Taste Maker", description: "Выбрать 3-5 любимых категорий. Достижение усиливает персонализацию и помогает рекомендациям.", icon: Heart, accent: "from-rose-300/15 to-slate-950" },
  { title: "Map Scout", description: "Построить первый маршрут до партнёра. Бесплатное исследование города без покупки.", icon: Route, accent: "from-cyan-300/15 to-slate-950" },
  { title: "Privacy Checked", description: "Открыть настройки приватности. Хорошее доверительное достижение, показывающее заботу о пользователе.", icon: ShieldCheck, accent: "from-emerald-300/15 to-slate-950" },
  { title: "Helpful Explorer", description: "Оставить отзыв или сообщить об ошибке адреса. Пользователь помогает улучшать сеть партнёров.", icon: UsersRound, accent: "from-violet-300/15 to-slate-950" },
  { title: "Category Expert", description: "Развивать любимую категорию через открытия карточек, маршруты, сохранения и отзывы.", icon: Star, accent: "from-amber-300/15 to-slate-950" },
];

const achievementRows = [
  ["Unlocked", "First Signal", "QR opened · today", QrCode, true],
  ["In progress", "Map Scout", "Build 1 route · 0/1", Map, false],
  ["Locked", "Community Helper", "Leave helpful feedback", Lock, false],
];

export default function AchievementsConceptPage() {
  return (
    <ConceptPageShell
      eyebrow="Achievement design"
      title="Достижения без давления на покупки"
      description="Достижения должны награждать исследование, настройку профиля, доверие, маршруты и помощь продукту. Покупки могут быть отдельной категорией, но не должны быть единственным путём прогресса."
    >
      <ConceptGrid items={items} />
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Achievement detail</h2>
              <p className="text-sm text-muted-foreground">Bottom-sheet style preview.</p>
            </div>
            <Badge className="bg-white text-black">ethical</Badge>
          </div>
          <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center rounded-[2.2rem] border border-amber-200/30 bg-gradient-to-br from-amber-200/25 to-white/[0.03] text-amber-100 shadow-[0_24px_80px_rgba(251,191,36,0.16)]">
            <Trophy className="h-16 w-16" />
          </div>
          <h3 className="text-center text-2xl font-semibold">Map Scout</h3>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">Build your first route to a partner location. No spending required.</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>0 / 1 route</span></div>
            <div className="h-2 rounded-full bg-white/10"><div className="h-2 w-[12%] rounded-full bg-white" /></div>
          </div>
        </div>
        <div className="grid gap-3">
          {achievementRows.map(([state, title, detail, Icon, unlocked]) => {
            const Glyph = Icon as typeof Award;
            return (
              <div key={title as string} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                <div className={unlocked ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200" : "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-muted-foreground"}>
                  <Glyph className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className="mb-1 border-white/10 text-[10px]">{state as string}</Badge>
                  <p className="font-semibold">{title as string}</p>
                  <p className="text-sm text-muted-foreground">{detail as string}</p>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
          <div className="rounded-3xl border border-white/10 bg-primary p-4 text-primary-foreground">
            <Sparkles className="mb-2 h-5 w-5" />
            <p className="font-semibold">UX principle</p>
            <p className="mt-1 text-sm opacity-75">Показываем “что сделать дальше”, а не “ты хуже других”.</p>
          </div>
        </div>
      </section>
    </ConceptPageShell>
  );
}
