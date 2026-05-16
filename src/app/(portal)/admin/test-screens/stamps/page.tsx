import { BadgeCheck, BookOpen, Building2, CircleDot, Coffee, Flame, Gem, Hash, Layers3, Lock, MapPinned, Moon, Palette, Scissors, ShoppingBag, Sparkles, Stamp, Type, UtensilsCrossed, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConceptPageShell } from "../concept-components";
import { cn } from "@/lib/utils";

const stampTypes = [
  {
    title: "Company signature",
    description: "Фирменная печать бренда: не категория, а маленький знак заведения со своей формой, легендой и серийностью.",
    icon: Building2,
  },
  {
    title: "Branch memory",
    description: "Печать конкретного адреса. Один бренд может иметь несколько разных печатей: Tverskaya bar, Nikolskaya room, Atrium pickup.",
    icon: MapPinned,
  },
  {
    title: "Seasonal artifact",
    description: "Временная печать сезонного меню, фестиваля или недели бонусов. После события остается в альбоме как воспоминание.",
    icon: UtensilsCrossed,
  },
  {
    title: "Collab relic",
    description: "Редкая печать совместной истории двух компаний: Coffee x Books, Beauty x Barber, Fitness x Health.",
    icon: BookOpen,
  },
];

const stamps = [
  {
    company: "Aurora Coffee",
    title: "Midnight Bean",
    rarity: "Seasonal",
    serial: "#128/500",
    place: "Tverskaya bar",
    story: "Печать ночного кофейного маршрута. Открывается за просмотр сезонного меню, сохранение точки и построение маршрута.",
    icon: Coffee,
    shape: "rounded-[2rem]",
    tone: "border-amber-200/55 bg-amber-300/16 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.2)]",
    aura: "from-amber-300/30 via-orange-400/10 to-transparent",
    pattern: "radial-gradient(circle at 30% 30%, rgba(251,191,36,.24), transparent 22%), radial-gradient(circle at 72% 65%, rgba(251,146,60,.18), transparent 24%)",
  },
  {
    company: "Fork & Flame",
    title: "Ember Table",
    rarity: "Company",
    serial: "#0421",
    place: "Open kitchen",
    story: "Теплая печать открытой кухни. Выглядит как след угля на плотной бумаге, но живет в цифровом альбоме.",
    icon: Flame,
    shape: "rounded-full",
    tone: "border-red-200/45 bg-red-400/16 text-red-100 shadow-[0_0_50px_rgba(248,113,113,0.18)]",
    aura: "from-red-300/28 via-rose-400/10 to-transparent",
    pattern: "radial-gradient(circle at 50% 42%, rgba(248,113,113,.25), transparent 30%), linear-gradient(135deg, transparent 44%, rgba(254,202,202,.14) 45%, transparent 47%)",
  },
  {
    company: "Velvet Beauty",
    title: "Mirror Bloom",
    rarity: "Branch",
    serial: "Nikolskaya · #77",
    place: "Nikolskaya room",
    story: "Мягкая зеркальная печать конкретного кабинета. В альбоме сразу понятно, где именно пользователь был.",
    icon: Sparkles,
    shape: "rounded-[999px_999px_2rem_2rem]",
    tone: "border-pink-200/45 bg-pink-300/16 text-pink-100 shadow-[0_0_50px_rgba(244,114,182,0.18)]",
    aura: "from-pink-300/28 via-fuchsia-400/10 to-transparent",
    pattern: "radial-gradient(circle at 50% 30%, rgba(244,114,182,.24), transparent 27%), radial-gradient(circle at 36% 72%, rgba(251,207,232,.18), transparent 18%)",
  },
  {
    company: "Pulse Fitness",
    title: "Iron Pulse",
    rarity: "Achievement",
    serial: "#300",
    place: "Leningradsky hall",
    story: "Кинетическая печать за исследование фитнес-партнеров. Ее можно получить без покупки, через маршрут и активность.",
    icon: Gem,
    shape: "rounded-[1.35rem] rotate-3",
    tone: "border-emerald-200/45 bg-emerald-300/16 text-emerald-100 shadow-[0_0_50px_rgba(52,211,153,0.18)]",
    aura: "from-emerald-300/28 via-teal-400/10 to-transparent",
    pattern: "linear-gradient(135deg, rgba(52,211,153,.2), transparent 38%), radial-gradient(circle at 70% 70%, rgba(167,243,208,.18), transparent 22%)",
  },
  {
    company: "Urban Retail",
    title: "Neon Bag",
    rarity: "Limited",
    serial: "Drop 01",
    place: "Tsvetnoy corner",
    story: "Лимитированный отпечаток первого retail-дропа. Похож на неоновый ярлык, найденный в городе.",
    icon: ShoppingBag,
    shape: "rounded-[1rem_2.3rem_1rem_2.3rem]",
    tone: "border-cyan-200/45 bg-cyan-300/16 text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,0.18)]",
    aura: "from-cyan-300/28 via-sky-400/10 to-transparent",
    pattern: "radial-gradient(circle at 25% 75%, rgba(34,211,238,.2), transparent 20%), linear-gradient(90deg, transparent 48%, rgba(165,243,252,.16) 49%, transparent 51%)",
  },
  {
    company: "Coffee x Barber",
    title: "Quiet Morning",
    rarity: "Collab",
    serial: "#009/250",
    place: "Morning route",
    story: "Совместная печать кофейни и барбера. Открывается, если сохранить пару точек и построить спокойный утренний маршрут.",
    icon: Scissors,
    shape: "rounded-[2rem] -rotate-2",
    tone: "border-violet-200/45 bg-violet-300/16 text-violet-100 shadow-[0_0_50px_rgba(167,139,250,0.18)]",
    aura: "from-violet-300/28 via-fuchsia-400/10 to-transparent",
    pattern: "radial-gradient(circle at 70% 30%, rgba(167,139,250,.24), transparent 25%), radial-gradient(circle at 25% 70%, rgba(217,70,239,.16), transparent 22%)",
  },
];

const lockedStamps = ["Secret ramen", "Arbat night", "Founder ink"];

type StampItem = (typeof stamps)[number] & {
  borderClass?: string;
  containerClass?: string;
  contentClass?: string;
  diamondFrame?: boolean;
  innerClass?: string;
  label?: string;
  sealText?: string;
};

const baseCustomizationStamp: StampItem = {
  ...stamps[0],
  title: "Base seal",
  rarity: "Base",
  serial: "#000",
  place: "Base style",
  story: "Base customizable seal.",
  icon: Coffee,
  shape: "rounded-[2rem]",
  tone: "border-amber-200/55 bg-amber-300/16 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.2)]",
  aura: "from-amber-300/28 via-orange-400/10 to-transparent",
  pattern: "radial-gradient(circle at 30% 30%, rgba(251,191,36,.22), transparent 22%), radial-gradient(circle at 72% 65%, rgba(251,146,60,.16), transparent 24%)",
  label: "base",
};

function stampPreview(overrides: Partial<StampItem>): StampItem {
  return { ...baseCustomizationStamp, ...overrides };
}

const customizationGroups = [
  {
    title: "Core symbol",
    description: "Главная иконка внутри печати: чашка, огонь, ножницы, сумка, звезда или авторский знак компании.",
    examples: ["Coffee cup", "flame", "mirror sparkle", "barber scissors", "shopping bag", "custom brand monogram"],
    previews: [
      stampPreview({ icon: Coffee, label: "coffee" }),
      stampPreview({ icon: Flame, label: "flame" }),
      stampPreview({ icon: Sparkles, label: "sparkle" }),
      stampPreview({ icon: Scissors, label: "barber" }),
      stampPreview({ icon: ShoppingBag, label: "retail" }),
      stampPreview({ icon: Gem, label: "gem" }),
    ],
    icon: Sparkles,
    preview: stamps[0],
  },
  {
    title: "Seal shape",
    description: "Форма оттиска: круг, мягкий квадрат, арка, ромб, билет, повернутый знак или асимметричная монограмма.",
    examples: ["classic circle", "soft square", "temple arch", "ticket stub", "capsule seal", "wax-seal blob"],
    previews: [
      stampPreview({ shape: "rounded-full", label: "circle" }),
      stampPreview({ shape: "rounded-[2rem]", label: "soft" }),
      stampPreview({ shape: "rounded-[999px_999px_2rem_2rem]", label: "arch" }),
      stampPreview({ shape: "rounded-[0.8rem_2.2rem_0.8rem_2.2rem]", label: "ticket" }),
      stampPreview({ shape: "rounded-[2.6rem_1.4rem_2.6rem_1.4rem]", label: "capsule" }),
      stampPreview({ shape: "rounded-[2.5rem_1.2rem_2.2rem_1.4rem]", label: "wax" }),
    ],
    icon: CircleDot,
    preview: stamps[2],
  },
  {
    title: "Ink color",
    description: "Цвет чернил и свечения. Можно привязать к бренду, сезону, редкости или настроению заведения.",
    examples: ["amber night coffee", "red ember kitchen", "cyan retail drop", "pink beauty bloom", "emerald fitness pulse", "violet collab"],
    previews: [
      stampPreview({ tone: "border-amber-200/55 bg-amber-300/16 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.2)]", aura: "from-amber-300/28 via-orange-400/10 to-transparent", label: "amber" }),
      stampPreview({ tone: "border-red-200/50 bg-red-400/16 text-red-100 shadow-[0_0_50px_rgba(248,113,113,0.18)]", aura: "from-red-300/28 via-rose-400/10 to-transparent", label: "ember" }),
      stampPreview({ tone: "border-cyan-200/50 bg-cyan-300/16 text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,0.18)]", aura: "from-cyan-300/28 via-sky-400/10 to-transparent", label: "cyan" }),
      stampPreview({ tone: "border-pink-200/50 bg-pink-300/16 text-pink-100 shadow-[0_0_50px_rgba(244,114,182,0.18)]", aura: "from-pink-300/28 via-fuchsia-400/10 to-transparent", label: "bloom" }),
      stampPreview({ tone: "border-emerald-200/50 bg-emerald-300/16 text-emerald-100 shadow-[0_0_50px_rgba(52,211,153,0.18)]", aura: "from-emerald-300/28 via-teal-400/10 to-transparent", label: "pulse" }),
      stampPreview({ tone: "border-violet-200/50 bg-violet-300/16 text-violet-100 shadow-[0_0_50px_rgba(167,139,250,0.18)]", aura: "from-violet-300/28 via-fuchsia-400/10 to-transparent", label: "violet" }),
    ],
    icon: Palette,
    preview: stamps[1],
  },
  {
    title: "Border language",
    description: "Обводки, пунктир, двойное кольцо, внутренние линии, микроточки и потертости делают печать живой.",
    examples: ["dashed inner ring", "double contour", "micro dots", "worn ink corners", "thin city-grid lines", "branch address rim"],
    previews: [
      stampPreview({ borderClass: "border-dashed border-current/55", innerClass: "border-current/20", label: "dashed" }),
      stampPreview({ borderClass: "border-double border-4 border-current/45", innerClass: "border-current/35", label: "double" }),
      stampPreview({ borderClass: "border-dotted border-current/60", innerClass: "border-dotted border-current/35", label: "dotted" }),
      stampPreview({ borderClass: "border-dashed border-current/35", innerClass: "border-current/10", label: "worn" }),
      stampPreview({ borderClass: "border-solid border-current/45", innerClass: "border-dashed border-current/25", label: "grid" }),
      stampPreview({ borderClass: "border-solid border-current/60", innerClass: "border-current/40", sealText: "BRANCH", label: "rim" }),
    ],
    icon: Layers3,
    preview: stamps[3],
  },
  {
    title: "Background aura",
    description: "Фон карточки вокруг печати: градиент, сетка, мягкие пятна, направленный свет или сезонная текстура.",
    examples: ["radial glow", "city grid", "warm paper noise", "neon mist", "seasonal snow dust", "coffee steam haze"],
    previews: [
      stampPreview({ aura: "from-amber-300/28 via-orange-400/10 to-transparent", pattern: "radial-gradient(circle at 50% 35%, rgba(251,191,36,.24), transparent 28%)", label: "glow" }),
      stampPreview({ aura: "from-slate-200/12 via-cyan-400/10 to-transparent", pattern: "linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)", label: "grid" }),
      stampPreview({ aura: "from-stone-200/18 via-amber-300/10 to-transparent", pattern: "radial-gradient(circle at 22% 28%, rgba(255,255,255,.18), transparent 16%), radial-gradient(circle at 70% 75%, rgba(251,191,36,.14), transparent 18%)", label: "paper" }),
      stampPreview({ aura: "from-cyan-300/24 via-fuchsia-400/10 to-transparent", pattern: "radial-gradient(circle at 70% 35%, rgba(34,211,238,.22), transparent 25%)", label: "neon" }),
      stampPreview({ aura: "from-sky-200/20 via-white/10 to-transparent", pattern: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 8%), radial-gradient(circle at 70% 55%, rgba(255,255,255,.18), transparent 10%)", label: "snow" }),
      stampPreview({ aura: "from-orange-200/22 via-stone-400/10 to-transparent", pattern: "radial-gradient(ellipse at 40% 25%, rgba(251,191,36,.18), transparent 28%), radial-gradient(ellipse at 65% 75%, rgba(255,255,255,.12), transparent 30%)", label: "steam" }),
    ],
    icon: Wand2,
    preview: stamps[4],
  },
  {
    title: "Rarity system",
    description: "Тип и редкость: Company, Branch, Seasonal, Collab, Limited, Founder, Secret, Event.",
    examples: ["Company", "Branch", "Seasonal", "Collab", "Limited", "Founder", "Secret", "Event"],
    previews: [
      stampPreview({ rarity: "Company", sealText: "COMP", label: "company" }),
      stampPreview({ rarity: "Branch", sealText: "BRANCH", label: "branch" }),
      stampPreview({ rarity: "Seasonal", sealText: "SEASON", label: "season" }),
      stampPreview({ rarity: "Collab", sealText: "COLLAB", label: "collab" }),
      stampPreview({ rarity: "Limited", sealText: "LIMITED", label: "limited" }),
      stampPreview({ rarity: "Secret", sealText: "SECRET", label: "secret" }),
    ],
    icon: BadgeCheck,
    preview: stamps[5],
  },
  {
    title: "Serial number",
    description: "Серийность делает печать коллекционной. Номер может быть глобальным, сезонным или привязанным к филиалу.",
    examples: ["#009/250", "#0421", "Drop 01", "Nikolskaya · #77", "May 2026 · #128", "Founder #001"],
    previews: [
      stampPreview({ serial: "#009/250", label: "#009/250" }),
      stampPreview({ serial: "#0421", label: "#0421" }),
      stampPreview({ serial: "Drop 01", label: "drop 01" }),
      stampPreview({ serial: "Nikolskaya · #77", label: "branch #77" }),
      stampPreview({ serial: "May 2026 · #128", label: "may #128" }),
      stampPreview({ serial: "Founder #001", label: "founder" }),
    ],
    icon: Hash,
    preview: stamps[0],
  },
  {
    title: "Name and story",
    description: "Название и легенда объясняют, почему печать существует: ночное меню, коллаборация, адрес, маршрут, событие.",
    examples: ["Midnight Bean", "Quiet Morning", "Ember Table", "Mirror Bloom", "Iron Pulse", "Neon Bag"],
    previews: [
      stampPreview({ title: "Midnight Bean", label: "Midnight Bean" }),
      stampPreview({ title: "Quiet Morning", label: "Quiet Morning" }),
      stampPreview({ title: "Ember Table", label: "Ember Table" }),
      stampPreview({ title: "Mirror Bloom", label: "Mirror Bloom" }),
      stampPreview({ title: "Iron Pulse", label: "Iron Pulse" }),
      stampPreview({ title: "Neon Bag", label: "Neon Bag" }),
    ],
    icon: Type,
    preview: stamps[2],
  },
];

function SealGlyph({ stamp, size = "md" }: { stamp: StampItem; size?: "sm" | "md" | "lg" }) {
  const Icon = stamp.icon;
  const sizeClass = size === "lg" ? "h-40 w-40" : size === "sm" ? "h-20 w-20" : "h-28 w-28";
  const iconClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const borderClass = stamp.borderClass ?? "border-dashed border-current/55";
  const innerClass = stamp.innerClass ?? "border-current/20";
  const sealText = stamp.sealText ?? "seal";

  return (
    <div className={cn("relative grid place-items-center border-2 bg-slate-950/90", sizeClass, stamp.shape, stamp.tone, stamp.containerClass)}>
      <div className="absolute -inset-5 rounded-full bg-current/10 blur-2xl" />
      {stamp.diamondFrame ? (
        <>
          <div className="absolute inset-[17%] rotate-45 rounded-[1.05rem] border-2 border-current/70 bg-current/5" />
          <div className="absolute inset-[28%] rotate-45 rounded-[0.75rem] border border-dashed border-current/40" />
        </>
      ) : null}
      {!stamp.diamondFrame ? (
        <div className={cn("absolute inset-3 border", stamp.shape, borderClass)} />
      ) : null}
      <div className={cn("absolute inset-6 rounded-full border", innerClass, stamp.contentClass)} />
      {!stamp.diamondFrame ? (
        <>
          <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-current/45 blur-[1px]" />
          <div className="absolute bottom-6 right-4 h-1.5 w-1.5 rounded-full bg-current/35 blur-[1px]" />
        </>
      ) : null}
      <Icon className={cn("relative drop-shadow-[0_0_18px_rgba(255,255,255,0.55)]", iconClass, stamp.contentClass)} />
      <span className={cn("absolute bottom-3 rounded-full border border-current/30 bg-black/45 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-current", stamp.contentClass)}>
        {sealText}
      </span>
    </div>
  );
}

function StampCard({ stamp, featured = false }: { stamp: StampItem; featured?: boolean }) {
  return (
    <article className={cn("group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0d1118] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-0.5 hover:border-white/22", featured && "min-h-full")}>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80", stamp.aura)} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative flex items-start justify-between gap-3">
        <Badge variant="outline" className="border-white/15 bg-black/25 text-[10px] font-black uppercase tracking-[0.12em] text-white">
          {stamp.rarity}
        </Badge>
        <span className="rounded-full border border-white/10 bg-white px-2.5 py-1 font-mono text-[10px] font-black text-slate-950">{stamp.serial}</span>
      </div>

      <div className={cn("relative my-4 grid place-items-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35", featured ? "h-56" : "h-40")}>
        <div className="absolute inset-0" style={{ background: stamp.pattern }} />
        <div className="absolute inset-x-6 top-5 h-px bg-white/15" />
        <div className="absolute inset-x-10 bottom-6 h-px bg-white/10" />
        <SealGlyph stamp={stamp} size={featured ? "lg" : "md"} />
      </div>

      <div className="relative">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary/85">{stamp.company}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className={cn("font-semibold tracking-tight", featured ? "text-3xl" : "text-xl")}>{stamp.title}</h3>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] text-muted-foreground">{stamp.place}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{stamp.story}</p>
      </div>
    </article>
  );
}

function LockedStamp({ name }: { name: string }) {
  return (
    <div className="relative grid min-h-[8.5rem] place-items-center overflow-hidden rounded-[1.4rem] border border-dashed border-white/15 bg-black/25 p-3 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_38%)]" />
      <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-muted-foreground">
        <Lock className="h-6 w-6" />
      </div>
      <p className="relative text-xs font-semibold text-muted-foreground">{name}</p>
    </div>
  );
}

function CustomizationCard({ item, index }: { item: (typeof customizationGroups)[number]; index: number }) {
  const Icon = item.icon;

  return (
    <article className="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4 transition duration-300 hover:border-white/25">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-55", item.preview.aura)} />
      <div className="relative space-y-4">
        <div className="grid gap-4 xl:grid-cols-[auto_0.9fr_1.4fr] xl:items-start">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/35 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold">{item.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.examples.map((example) => (
              <span key={example} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {example}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-6">
          {item.previews.map((stamp, previewIndex) => (
            <div
              key={`${item.title}-${stamp.title}-${previewIndex}`}
              className="relative grid min-h-[9.75rem] place-items-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/25 p-3"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-55", stamp.aura)} />
              <div className="relative grid place-items-center gap-2">
                <SealGlyph stamp={stamp} size="sm" />
                <span className="max-w-[7.5rem] truncate rounded-full border border-white/10 bg-black/35 px-2 py-1 text-center text-[10px] font-semibold text-muted-foreground">
                  {stamp.label}
                </span>
              </div>
              <span className="absolute right-2 top-2 max-w-[5.5rem] truncate rounded-full bg-white px-2 py-0.5 font-mono text-[9px] font-black text-slate-950">
                {stamp.serial}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function StampsConceptPage() {
  return (
    <ConceptPageShell
      eyebrow="Collectible seals"
      title="Stamp Book: уникальные печати заведений"
      description="Не категории и не бейджики ради бейджиков. Это цифровой альбом уникальных печатей: у каждой компании, точки, сезона и коллаборации может быть свой маленький арт-объект. Пользователь собирает места, истории и маршруты."
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080b12] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="relative grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
          <div>
            <Badge className="mb-4 gap-1 bg-white text-black"><Stamp className="h-3 w-3" /> stamp album prototype</Badge>
            <h2 className="max-w-xl text-4xl font-semibold tracking-tight">Печати должны ощущаться как сувениры из города</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Их можно выдавать за бесплатные действия: открыть историю заведения, сохранить адрес, построить маршрут, посетить точку или собрать сезонную пару компаний.
            </p>
            <div className="mt-5 grid max-w-lg grid-cols-3 gap-2 text-center">
              {[["6", "collected"], ["3", "hidden"], ["2", "limited"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <StampCard stamp={stamps[0]} featured />
            <div className="grid gap-4">
              <StampCard stamp={stamps[5]} />
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Hidden silhouettes</p>
                  <Badge variant="outline" className="border-white/10">teaser</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {lockedStamps.map((name) => <LockedStamp key={name} name={name} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stampTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.title} className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-4">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
              <h2 className="font-semibold">{type.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{type.description}</p>
            </div>
          );
        })}
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070a11] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.11),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.12),transparent_32%)]" />
        <div className="relative mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 border-white/10 bg-white/[0.04]">
              <Wand2 className="mr-1 h-3 w-3" />
              customization map
            </Badge>
            <h2 className="text-2xl font-semibold">Что можно кастомизировать в печати</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Почти всё: от базового символа до серийного номера и легенды. Поэтому две кофейни не будут выглядеть одинаково, даже если обе используют иконку чашки.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            <span className="font-semibold">8 layers</span>
            <span className="ml-2 text-muted-foreground">для уникальности</span>
          </div>
        </div>

        <div className="relative grid gap-3">
          {customizationGroups.map((item, index) => (
            <CustomizationCard key={item.title} item={item} index={index} />
          ))}
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-semibold">Пример одной и той же компании</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aurora Coffee может иметь базовую печать бренда, отдельную печать Tverskaya bar, сезонную Midnight Bean и редкую печать коллаборации с книжным магазином.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[stamps[0], stamps[1], stamps[5]].map((stamp) => (
                <div key={stamp.title} className="grid place-items-center rounded-2xl border border-white/10 bg-black/25 p-3">
                  <SealGlyph stamp={stamp} size="sm" />
                  <p className="mt-2 text-center text-[11px] font-semibold">{stamp.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/10 via-white/[0.03] to-slate-950 p-4">
            <h3 className="font-semibold">Как это можно хранить потом</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              В базе достаточно хранить не картинку, а набор параметров: iconKey, shapeKey, paletteKey, borderKey, patternKey, rarity, serial и story. Тогда печати легко рендерить, менять и масштабировать.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              {["iconKey: coffee", "shapeKey: soft-square", "paletteKey: amber-night", "rarity: seasonal", "serial: #128/500"].map((line) => (
                <code key={line} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-muted-foreground">{line}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#0b0f17] p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Collected stamps</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              В реальной версии каждая карточка может открываться в подробный паспорт: как получена, где выпущена, редкость, история, карта и связанная компания.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Company", "Seasonal", "Collab", "Branch"].map((filter, idx) => (
              <Badge key={filter} variant={idx === 0 ? "default" : "outline"} className="border-white/10">{filter}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {stamps.map((stamp) => <StampCard key={stamp.title} stamp={stamp} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-4 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-200" />
            <h2 className="text-xl font-semibold">Как получать бесплатно</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["Открыть историю", "Посмотреть карточку заведения и легенду печати."],
              ["Сохранить место", "Добавить филиал, сезонное меню или коллаборацию в избранное."],
              ["Построить маршрут", "Собрать путь до точки или пары компаний на карте."],
              ["Сканировать QR", "Опционально подтвердить визит без обязательной покупки."],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/10 to-slate-950 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Passport detail</h2>
              <p className="text-sm text-muted-foreground">Так может выглядеть раскрытая карточка одной печати.</p>
            </div>
            <Moon className="h-6 w-6 text-amber-100" />
          </div>
          <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
            <SealGlyph stamp={stamps[0]} size="lg" />
            <div>
              <Badge className="mb-3 bg-amber-100 text-amber-950">Seasonal · #128/500</Badge>
              <h3 className="text-2xl font-semibold">Midnight Bean</h3>
              <p className="mt-1 text-primary">Aurora Coffee · Tverskaya bar</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Ограниченная печать ночного кофейного маршрута по центру Москвы. Она остается в альбоме даже после окончания сезонного меню.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-xl bg-black/25 px-3 py-2">issued: May 2026</span>
                <span className="rounded-xl bg-black/25 px-3 py-2">source: route + save</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ConceptPageShell>
  );
}

