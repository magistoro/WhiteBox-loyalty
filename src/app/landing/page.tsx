"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Crown,
  Database,
  Flame,
  Gift,
  Handshake,
  History,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Medal,
  QrCode,
  Repeat2,
  ShieldCheck,
  Star,
  Sparkles,
  Store,
  Target,
  Ticket,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { WhiteBoxLogo } from "@/components/brand/WhiteBoxLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Audience = "clients" | "companies" | "team";

const audienceCopy = {
  clients: {
    label: "Клиент",
    title: "Один кошелёк для баллов, подписок и QR",
    text: "Пользователь открывает WhiteBox с телефона, сканирует QR, видит баланс, историю и доступные подписки без пластиковых карт.",
    icon: WalletCards,
    points: ["QR-сканирование", "История операций", "Избранные категории", "Активные подписки"],
  },
  companies: {
    label: "Компания",
    title: "Лояльность, которую можно настроить без разработки",
    text: "Компания задаёт уровни, кешбек, категории, подписки и минимальный порог списания баллов в понятном кабинете.",
    icon: Store,
    points: ["Уровни клиентов", "Кастомные периоды", "Промо-дни", "Своя база клиентов"],
  },
  team: {
    label: "Команда",
    title: "Админка для контроля, аудита и безопасности",
    text: "Команда видит пользователей, компании, карту БД, critical actions и историю действий поддержки.",
    icon: LayoutDashboard,
    points: ["Audit streams", "Security actions", "DB map", "CRUD без хаоса"],
  },
} satisfies Record<
  Audience,
  {
    label: string;
    title: string;
    text: string;
    icon: typeof WalletCards;
    points: string[];
  }
>;

const features = [
  {
    icon: QrCode,
    title: "QR first",
    text: "Клиент быстро подтверждает покупку или подписку в точке продаж.",
  },
  {
    icon: CircleDollarSign,
    title: "Баллы отдельно",
    text: "Баллы и подписки не смешиваются, но могут влиять на уровни по правилам компании.",
  },
  {
    icon: BadgeCheck,
    title: "Уровни",
    text: "Компания сама задаёт пороги трат и процент кешбека для каждого уровня.",
  },
  {
    icon: ShieldCheck,
    title: "Support safety",
    text: "Пароли закрыты, email меняется через ссылку, критичные действия пишутся в аудит.",
  },
  {
    icon: Database,
    title: "DB map",
    text: "Визуальная карта БД помогает команде понимать связи и быстрее разбирать инциденты.",
  },
  {
    icon: BarChart3,
    title: "Growth ready",
    text: "Архитектура готова к retention, промо-кампаниям, сегментам и аналитике.",
  },
];

const timeline = [
  ["01", "Создаём компанию", "Категории, профиль, правила баллов и уровни."],
  ["02", "Выпускаем подписки", "Период, цена, бонусные дни и категория сервиса."],
  ["03", "Клиент сканирует QR", "Баллы, покупки и подписки попадают в историю."],
  ["04", "Команда контролирует", "Audit log, security actions и база клиентов."],
];

const loyaltySlots = [
  { icon: QrCode, label: "Scan" },
  { icon: Star, label: "+80" },
  { icon: Gift, label: "Gift" },
  { icon: Flame, label: "Streak" },
  { icon: Ticket, label: "Promo" },
  { icon: Medal, label: "Silver" },
  { icon: Crown, label: "Gold" },
  { icon: Sparkles, label: "Bonus" },
  { icon: Trophy, label: "Prize" },
  { icon: BadgeCheck, label: "VIP" },
];

const clientMissions = [
  {
    icon: QrCode,
    title: "Сканировать QR",
    text: "Клиент видит понятную цель: отсканировать чек и сразу получить прогресс.",
    reward: "+80 баллов",
    progress: 72,
  },
  {
    icon: Flame,
    title: "Собрать серию",
    text: "Еженедельный streak мягко возвращает пользователя без навязчивости.",
    reward: "x1.5 кэшбек",
    progress: 58,
  },
  {
    icon: Gift,
    title: "Открыть награду",
    text: "После нужного порога клиент получает конкретный подарок, а не абстрактные цифры.",
    reward: "подарок открыт",
    progress: 86,
  },
];

const businessScenarios = [
  {
    icon: Store,
    title: "Кофейня",
    tone: "утренние покупки",
    stats: ["+18% повторных визитов", "3 уровня лояльности", "7 дней промо"],
    steps: ["QR на кассе", "Gold для постоянных", "подарок за streak"],
  },
  {
    icon: Users,
    title: "Фитнес",
    tone: "абонементы и продления",
    stats: ["+24% продлений", "подписки на 3 месяца", "заморозка в аудите"],
    steps: ["контроль подписки", "уровни по тратам", "напоминания"],
  },
  {
    icon: CalendarDays,
    title: "Сервис",
    tone: "регулярная оплата",
    stats: ["+31% LTV", "порог списания", "чистая история"],
    steps: ["кастомный период", "баллы отдельно", "клиентская база"],
  },
];

export default function LandingPage() {
  const [audience, setAudience] = useState<Audience>("companies");
  const [clientMission, setClientMission] = useState(0);
  const [businessScenario, setBusinessScenario] = useState(0);
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const active = audienceCopy[audience];
  const ActiveIcon = active.icon;
  const activeMission = clientMissions[clientMission];
  const ActiveMissionIcon = activeMission.icon;
  const activeScenario = businessScenarios[businessScenario];
  const ActiveScenarioIcon = activeScenario.icon;
  const contactSubject = useMemo(() => encodeURIComponent("WhiteBox pilot request"), []);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (leadStatus === "sending") {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setLeadStatus("sending");
    setLeadMessage("");

    try {
      const response = await fetch("/api/landing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, startedAt: formStartedAt }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message || "Не удалось отправить заявку. Попробуйте ещё раз.");
      }

      form.reset();
      setFormStartedAt(Date.now());
      setLeadStatus("sent");
      setLeadMessage("Заявка улетела в Telegram. Я скоро отвечу.");
    } catch (error) {
      setLeadStatus("error");
      setLeadMessage(error instanceof Error ? error.message : "Не удалось отправить заявку.");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(100,180,255,0.18),transparent_32%),linear-gradient(180deg,#03060d_0%,#07101e_46%,#03060d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#03060d]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3">
            <WhiteBoxLogo className="h-10 w-10 drop-shadow-[0_0_18px_rgba(120,220,255,0.45)]" />
            <div>
              <p className="text-lg font-semibold leading-none">WhiteBox</p>
              <p className="text-xs text-white/48">loyalty infrastructure</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/58 md:flex">
            <a href="#product" className="hover:text-white">Продукт</a>
            <a href="#flow" className="hover:text-white">Сценарий</a>
            <a href="#security" className="hover:text-white">Безопасность</a>
            <a href="#contact" className="hover:text-white">Контакт</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" className="hidden border border-white/10 bg-white/8 text-white hover:bg-white/14 sm:inline-flex">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="bg-white text-[#07101e] shadow-[0_0_26px_rgba(255,255,255,0.24)] hover:bg-white/88">
              <a href="#contact">
                Запустить пилот
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section id="product" className="relative z-10">
        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/7 px-3 py-2 text-sm text-white/72 shadow-[0_0_34px_rgba(255,255,255,0.08)]">
              <Sparkles className="h-4 w-4 text-white" />
              QR wallet, subscriptions, audit, admin console
            </div>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              WhiteBox
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-white/64 sm:text-2xl">
              Тёмная, чистая система лояльности: клиенты управляют баллами в телефоне, компании выпускают подписки, команда контролирует безопасность.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-white text-[#07101e] shadow-[0_0_28px_rgba(255,255,255,0.22)] hover:bg-white/88">
                <a href="#contact">
                  Обсудить запуск
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/16 bg-white/7 text-white hover:bg-white/12">
                <Link href="/admin">
                  Открыть админку
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["3", "роли"],
                ["2", "системы ценности"],
                ["∞", "уровней"],
                ["0", "доступа к паролям"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/6 p-3 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs leading-4 text-white/48">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-[560px] w-full max-w-[620px] sm:h-[640px]">
            <div className="absolute inset-10 rounded-full border border-white/10 shadow-[0_0_90px_rgba(140,190,255,0.12)]" />
            <div className="absolute inset-20 rounded-full border border-dashed border-white/16" />
            <div className="absolute left-[12%] top-[11%] flex h-16 w-16 items-center justify-center rounded-full border border-white/18 bg-white/10 shadow-[0_0_26px_rgba(255,255,255,0.22)] backdrop-blur">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="absolute right-[7%] top-[25%] flex h-20 w-20 items-center justify-center rounded-lg border border-white/18 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.18)] backdrop-blur">
              <Ticket className="h-9 w-9 text-white" />
            </div>
            <div className="absolute bottom-[17%] left-[5%] flex h-18 w-18 items-center justify-center rounded-lg border border-white/18 bg-white/10 p-4 shadow-[0_0_30px_rgba(255,255,255,0.18)] backdrop-blur">
              <Store className="h-8 w-8 text-white" />
            </div>

            <div className="absolute left-[18%] top-[20%] h-[290px] w-[290px] rotate-[-6deg] rounded-lg border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.035))] p-5 shadow-[0_0_70px_rgba(255,255,255,0.16)] backdrop-blur-xl sm:h-[330px] sm:w-[330px]">
              <div className="flex items-center justify-between">
                <WhiteBoxLogo className="h-9 w-9" />
                <span className="rounded-full border border-white/14 px-3 py-1 text-xs text-white/68">wallet</span>
              </div>
              <div className="mt-10 flex justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-lg border border-white/18 bg-white/12 shadow-[0_0_50px_rgba(255,255,255,0.18)]">
                  <Gift className="h-16 w-16 text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.75)]" />
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-2">
                {["coffee", "gym", "food"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-black/18 px-2 py-2 text-center text-xs text-white/62">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-[6%] right-[2%] w-[340px] rotate-[4deg] rounded-lg border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.045))] p-4 shadow-[0_0_72px_rgba(255,255,255,0.16)] backdrop-blur-xl sm:w-[400px]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Loyalty level</p>
                  <p className="text-xs text-white/48">Gold progress</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <Crown className="h-4 w-4" />
                  7 / 10
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-[72%] rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {loyaltySlots.map((slot, index) => {
                  const SlotIcon = slot.icon;
                  const filled = index < 7;

                  return (
                    <div
                      key={slot.label}
                      className={cn(
                        "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] font-semibold transition",
                        filled
                          ? "border-white/22 bg-white/18 text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                          : "border-white/10 bg-black/22 text-white/34",
                      )}
                    >
                      <SlotIcon className={cn("h-4 w-4", filled && "drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]")} />
                      <span>{slot.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-black/22 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#07101e] shadow-[0_0_22px_rgba(255,255,255,0.26)]">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Next reward</p>
                  <p className="text-[11px] text-white/50">3 scans to unlock bonus days</p>
                </div>
                <Sparkles className="h-5 w-5 animate-pulse text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_44px_rgba(255,255,255,0.06)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-white/48">Польза для клиентов</p>
                  <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Баллы ощущаются как игра, а не как таблица</h2>
                </div>
                <div className="hidden rounded-lg border border-white/12 bg-white/10 p-3 text-white shadow-[0_0_26px_rgba(255,255,255,0.14)] sm:block">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-base leading-7 text-white/58">
                Клиент видит понятный прогресс, миссии, награды и историю. Он не думает “где моя карта”, он просто открывает WhiteBox и делает следующий шаг.
              </p>
              <div className="mt-6 grid gap-3">
                {clientMissions.map((mission, index) => {
                  const MissionIcon = mission.icon;
                  const selected = clientMission === index;

                  return (
                    <button
                      key={mission.title}
                      type="button"
                      onClick={() => setClientMission(index)}
                      className={cn(
                        "group grid gap-3 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 sm:grid-cols-[auto_1fr_auto] sm:items-center",
                        selected
                          ? "border-white/28 bg-white/14 shadow-[0_0_32px_rgba(255,255,255,0.12)]"
                          : "border-white/10 bg-black/22 hover:bg-white/8",
                      )}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/10 text-white">
                        <MissionIcon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-white">{mission.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-white/52">{mission.text}</span>
                      </span>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/78">
                        <Sparkles className="h-3.5 w-3.5" />
                        {mission.reward}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_26%),rgba(255,255,255,0.045)] p-5 shadow-[0_0_54px_rgba(255,255,255,0.08)] backdrop-blur sm:p-6">
              <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.14)]" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase text-white/48">Игровой виджет</p>
                    <h3 className="mt-2 text-2xl font-semibold">Сегодняшняя миссия</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#07101e] shadow-[0_0_26px_rgba(255,255,255,0.28)]">
                    <ActiveMissionIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="rounded-lg border border-white/12 bg-black/24 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{activeMission.title}</span>
                    <span className="text-white/56">{activeMission.progress}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.72)] transition-all duration-500"
                      style={{ width: `${activeMission.progress}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[QrCode, Gift, Star, Crown].map((Icon, index) => {
                      const unlocked = index <= Math.floor(activeMission.progress / 25);

                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] font-semibold transition",
                            unlocked ? "border-white/22 bg-white/14 text-white" : "border-white/10 bg-black/24 text-white/32",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {unlocked ? "open" : "locked"}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [WalletCards, "1 кошелёк", "все компании"],
                    [BellRing, "без спама", "только важное"],
                    [History, "история", "всё прозрачно"],
                  ].map(([Icon, title, text]) => {
                    const TypedIcon = Icon as typeof WalletCards;

                    return (
                      <div key={title as string} className="rounded-lg border border-white/10 bg-white/7 p-3">
                        <TypedIcon className="h-5 w-5 text-white" />
                        <p className="mt-3 text-sm font-semibold">{title as string}</p>
                        <p className="mt-1 text-xs text-white/44">{text as string}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-5 shadow-[0_0_44px_rgba(255,255,255,0.06)] backdrop-blur sm:p-6">
              <div className="absolute bottom-0 left-10 h-px w-1/2 bg-white shadow-[0_0_24px_rgba(255,255,255,0.9)]" />
              <p className="text-sm font-semibold uppercase text-white/48">Польза для бизнеса</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Компания управляет привычкой возвращаться</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/58">
                WhiteBox даёт бизнесу не просто “скидочную карту”, а набор рычагов: уровни, подписки, промо-дни, пороги списания и безопасную клиентскую историю.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {businessScenarios.map((scenario, index) => {
                  const ScenarioIcon = scenario.icon;
                  const selected = businessScenario === index;

                  return (
                    <button
                      key={scenario.title}
                      type="button"
                      onClick={() => setBusinessScenario(index)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition hover:-translate-y-0.5",
                        selected
                          ? "border-white/28 bg-white text-[#07101e] shadow-[0_0_30px_rgba(255,255,255,0.16)]"
                          : "border-white/10 bg-black/22 text-white hover:bg-white/8",
                      )}
                    >
                      <ScenarioIcon className="h-5 w-5" />
                      <p className="mt-4 font-semibold">{scenario.title}</p>
                      <p className={cn("mt-1 text-sm", selected ? "text-[#07101e]/58" : "text-white/48")}>{scenario.tone}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_44px_rgba(255,255,255,0.06)] backdrop-blur sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/12 bg-white/10 text-white">
                  <ActiveScenarioIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/48">Сценарий</p>
                  <h3 className="text-2xl font-semibold">{activeScenario.title}</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {activeScenario.stats.map((stat, index) => (
                  <div key={stat} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/22 p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#07101e]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-white/78">{stat}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-black/22 p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/78">
                  <Target className="h-4 w-4" />
                  Growth loop
                </div>
                <div className="grid gap-2">
                  {activeScenario.steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-2 text-sm text-white/58">
                      <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                      <span>{step}</span>
                      {index < activeScenario.steps.length - 1 && <Repeat2 className="ml-auto h-4 w-4 text-white/36" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.035] py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-white/50">Для кого</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Один продукт, три режима работы</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              WhiteBox не пытается быть одной страницей для всех. В телефоне он быстрый и понятный, в админке плотный и контролируемый.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(Object.keys(audienceCopy) as Audience[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAudience(key)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition",
                    audience === key
                      ? "border-white bg-white text-[#07101e] shadow-[0_0_24px_rgba(255,255,255,0.22)]"
                      : "border-white/12 bg-white/6 text-white/62 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {audienceCopy[key].label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/6 p-5 shadow-[0_0_40px_rgba(255,255,255,0.06)] backdrop-blur sm:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-white/12 bg-white/10 p-3 text-white shadow-[0_0_24px_rgba(255,255,255,0.12)]">
                <ActiveIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{active.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/58">{active.text}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {active.points.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/18 p-3">
                  <Check className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white/78">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-white/48">Возможности</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Рабочие блоки платформы</h2>
            </div>
            <Button asChild variant="outline" className="w-fit border-white/14 bg-white/7 text-white hover:bg-white/12">
              <a href="#contact">
                Связаться
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_34px_rgba(255,255,255,0.05)] backdrop-blur">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/14 bg-white/10 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="relative z-10 border-y border-white/10 bg-white/[0.035] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-white/48">Сценарий запуска</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">От первой компании до управляемой экосистемы</h2>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-4">
            {timeline.map(([step, title, text]) => (
              <div key={step} className="rounded-lg border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/42">{step}</p>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/54">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative z-10 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-white/48">Безопасность</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Поддержка помогает, но не получает лишнюю власть</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              Пароли не редактируются вручную, смена email подтверждается пользователем, force logout и freeze пишутся в audit.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              [ShieldCheck, "Пароль пользователя остаётся закрытым"],
              [Mail, "Смена email только через подтверждение"],
              [History, "Критичные действия видны в профиле"],
              [ClipboardList, "Manager и developer audit разделены"],
            ].map(([Icon, label]) => {
              const TypedIcon = Icon as typeof ShieldCheck;
              return (
                <div key={label as string} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <TypedIcon className="h-5 w-5 text-white" />
                  <span className="font-medium text-white/80">{label as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 border-t border-white/10 bg-white/[0.035] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-white/48">Контакт</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Запустим пилот с одной компанией</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              Начнём с базовых баллов, категорий и QR, а затем подключим подписки, уровни и расширенный аудит.
            </p>
            <div className="mt-7 rounded-lg border border-white/10 bg-black/22 p-5 shadow-[0_0_34px_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/10">
                  <Mail className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-sm text-white/42">Email</p>
                  <a href={`mailto:maksimpastuhov77@gmail.com?subject=${contactSubject}`} className="font-semibold text-white hover:text-white/78">
                    maksimpastuhov77@gmail.com
                  </a>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [MessageCircle, "Telegram", "форма пишет в личку"],
                  [ShieldCheck, "Anti-spam", "лимиты и honeypot"],
                  [Users, "Ready", "потом рассылки клиентам"],
                ].map(([Icon, title, text]) => {
                  const TypedIcon = Icon as typeof MessageCircle;

                  return (
                    <div key={title as string} className="rounded-lg border border-white/10 bg-white/6 p-3">
                      <TypedIcon className="h-4 w-4 text-white" />
                      <p className="mt-3 text-sm font-semibold">{title as string}</p>
                      <p className="mt-1 text-xs text-white/42">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <form onSubmit={handleContactSubmit} className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-[0_0_44px_rgba(255,255,255,0.06)] backdrop-blur sm:p-6">
            <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" required minLength={2} className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Имя" />
              <Input name="company" className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Компания" />
              <Input name="contact" required className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Email или Telegram" />
              <Input name="business" className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Сфера бизнеса" />
              <Textarea name="message" required minLength={10} className="min-h-36 border-white/12 bg-black/28 text-white placeholder:text-white/36 sm:col-span-2" placeholder="Что хотите проверить в пилоте?" />
            </div>
            {leadMessage && (
              <div
                className={cn(
                  "mt-4 rounded-lg border px-4 py-3 text-sm font-medium",
                  leadStatus === "sent"
                    ? "border-white/18 bg-white/10 text-white"
                    : "border-red-400/30 bg-red-500/10 text-red-100",
                )}
              >
                {leadMessage}
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={leadStatus === "sending"} className="bg-white text-[#07101e] hover:bg-white/88 disabled:opacity-60">
                {leadStatus === "sending" ? "Отправляем..." : "Отправить заявку"}
                <Handshake className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-white/48 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <WhiteBoxLogo className="h-8 w-8" />
            <span>WhiteBox, 2026</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <Link href="/" className="hover:text-white">TWA app</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
