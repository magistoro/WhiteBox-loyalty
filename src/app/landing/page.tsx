"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Database,
  Gift,
  Handshake,
  History,
  LayoutDashboard,
  Mail,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
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

const benefits = [
  {
    icon: WalletCards,
    title: "Один кошелек лояльности",
    text: "Баллы, подписки, уровни и история операций живут в телефоне клиента без пластиковых карт.",
  },
  {
    icon: Store,
    title: "Кабинет для бизнеса",
    text: "Компания настраивает категории, подписки, уровни, cashback и правила списания баллов.",
  },
  {
    icon: ShieldCheck,
    title: "Безопасная админка",
    text: "Роли, аудит, Telegram-уведомления и ручная верификация компаний защищают систему от хаоса.",
  },
];

const features = [
  [QrCode, "QR first", "Клиент подтверждает покупку или подписку через QR прямо в точке продаж."],
  [BadgeCheck, "Уровни клиентов", "Бизнес сам задает пороги трат и процент возврата для каждого уровня."],
  [Gift, "Подписки и бонусы", "Можно выпускать подписки с кастомным периодом и бонусными днями."],
  [Database, "DB map", "Команда видит структуру данных и связи прямо в админке."],
  [History, "Audit trail", "Критичные действия попадают в историю и остаются проверяемыми."],
  [BarChart3, "Growth ready", "Основа для промо, сегментов, retention и финансовых операций."],
] as const;

const steps = [
  ["01", "Компания подает заявку", "Партнер выбирает тип занятости и отправляет юридические данные на проверку."],
  ["02", "Админ проверяет", "Заявка попадает в админку и Telegram, паспортные данные не хранятся полностью."],
  ["03", "Доступ выдается вручную", "После approve компания получает безопасный Company-доступ."],
  ["04", "Клиенты используют QR", "Баллы, подписки и уровни начинают работать в единой системе."],
] as const;

export default function LandingPage() {
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const contactSubject = useMemo(() => encodeURIComponent("WhiteBox pilot request"), []);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadStatus === "sending") return;

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setLeadStatus("sending");
    setLeadMessage("");

    try {
      const response = await fetch("/api/landing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, startedAt: formStartedAt }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message || "Не удалось отправить заявку. Попробуйте еще раз.");

      form.reset();
      setFormStartedAt(Date.now());
      setLeadStatus("sent");
      setLeadMessage(result?.message || "Заявка получена. Я уже получил уведомление в Telegram.");
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3">
            <WhiteBoxLogo className="h-10 w-10 drop-shadow-[0_0_18px_rgba(120,220,255,0.45)]" />
            <div>
              <p className="text-lg font-semibold leading-none">WhiteBox</p>
              <p className="text-xs text-white/48">loyalty infrastructure</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/58 md:flex">
            <a href="#product" className="hover:text-white">Продукт</a>
            <a href="#business" className="hover:text-white">Бизнесу</a>
            <a href="#flow" className="hover:text-white">Сценарий</a>
            <a href="#contact" className="hover:text-white">Контакт</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" className="hidden border border-white/10 bg-white/8 text-white hover:bg-white/14 sm:inline-flex">
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild variant="outline" className="hidden border-white/16 bg-white/7 text-white hover:bg-white/12 lg:inline-flex">
              <Link href="/company/register">Стать партнером</Link>
            </Button>
            <Button asChild className="bg-white text-[#07101e] shadow-[0_0_26px_rgba(255,255,255,0.24)] hover:bg-white/88">
              <a href="#contact">Запустить пилот <ArrowRight className="h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </header>

      <section id="product" className="relative z-10">
        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/7 px-3 py-2 text-sm text-white/72 shadow-[0_0_34px_rgba(255,255,255,0.08)]">
              <Sparkles className="h-4 w-4 text-white" /> QR wallet, subscriptions, audit, admin console
            </div>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">WhiteBox</h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-white/64 sm:text-2xl">
              Темная, чистая система лояльности: клиенты управляют баллами в телефоне, компании выпускают подписки, команда контролирует безопасность.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-white text-[#07101e] shadow-[0_0_28px_rgba(255,255,255,0.22)] hover:bg-white/88">
                <a href="#contact">Обсудить запуск <MessageCircle className="h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/16 bg-white/7 text-white hover:bg-white/12">
                <Link href="/company/register">Зарегистрировать компанию <Store className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/16 bg-white/7 text-white hover:bg-white/12">
                <Link href="/admin">Открыть админку <LayoutDashboard className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[["3+", "роли админки"], ["2", "системы ценности"], ["∞", "уровней"], ["0", "доступа к паролям"]].map(([value, label]) => (
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
            <div className="absolute left-[18%] top-[20%] h-[290px] w-[290px] rotate-[-6deg] rounded-lg border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.035))] p-5 shadow-[0_0_70px_rgba(255,255,255,0.16)] backdrop-blur-xl sm:h-[330px] sm:w-[330px]">
              <div className="flex items-center justify-between">
                <WhiteBoxLogo className="h-9 w-9" />
                <span className="rounded-full border border-white/14 px-3 py-1 text-xs text-white/68">wallet</span>
              </div>
              <div className="mt-12 flex justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-white/18 bg-white/12 shadow-[0_0_50px_rgba(255,255,255,0.18)]">
                  <Gift className="h-16 w-16 text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.75)]" />
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-2">
                {["coffee", "gym", "food", "beauty", "sport", "auto"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-black/18 px-2 py-3 text-center text-xs text-white/58">{item}</div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-[10%] right-[2%] w-[82%] rotate-[4deg] rounded-lg border border-white/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] p-5 shadow-[0_0_70px_rgba(255,255,255,0.16)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Loyalty level</p>
                  <p className="text-sm text-white/48">Gold progress</p>
                </div>
                <span className="rounded-full border border-white/14 px-3 py-1 text-sm">7 / 10</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
                <div className="h-full w-[76%] rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.8)]" />
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {[QrCode, Sparkles, Gift, Trophy, BadgeCheck].map((Icon, index) => (
                  <div key={index} className="flex h-16 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="business" className="relative z-10 border-y border-white/10 bg-white/[0.035] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-white/48">Польза</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Для клиентов и бизнеса</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="w-fit border-white/14 bg-white/7 text-white hover:bg-white/12">
                <a href="#contact">Связаться <ChevronRight className="h-4 w-4" /></a>
              </Button>
              <Button asChild className="w-fit bg-white text-[#07101e] hover:bg-white/88">
                <Link href="/company/register">Стать партнером WhiteBox <Store className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_34px_rgba(255,255,255,0.05)] backdrop-blur">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/14 bg-white/10 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-white/48">Возможности</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Рабочие блоки платформы</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map(([Icon, title, text]) => (
              <article key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_34px_rgba(255,255,255,0.05)] backdrop-blur">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/14 bg-white/10 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="relative z-10 border-y border-white/10 bg-white/[0.035] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-white/48">Сценарий запуска</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">От заявки компании до работающей экосистемы</h2>
          </div>
          <div className="mt-9 grid gap-4 lg:grid-cols-4">
            {steps.map(([step, title, text]) => (
              <div key={step} className="rounded-lg border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/42">{step}</p>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/54">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 border-t border-white/10 bg-white/[0.035] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-white/48">Контакт</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Запустим пилот с одной компанией</h2>
            <p className="mt-4 text-lg leading-8 text-white/58">
              Можно сразу отправить заявку на верификацию компании или сначала обсудить пилот и сценарий запуска.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-white text-[#07101e] hover:bg-white/88">
                <Link href="/company/register">Создать и верифицировать компанию <ShieldCheck className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/14 bg-white/7 text-white hover:bg-white/12">
                <a href="#contact">Сначала обсудить пилот</a>
              </Button>
            </div>
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
                {[[MessageCircle, "Telegram", "форма пишет в личку"], [ShieldCheck, "Anti-spam", "лимиты и honeypot"], [Users, "Ready", "дальше рассылки клиентам"]].map(([Icon, title, text]) => {
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
            <input className="hidden" tabIndex={-1} autoComplete="off" name="url" aria-hidden="true" />
            <input className="hidden" tabIndex={-1} autoComplete="off" name="companyWebsite" aria-hidden="true" />
            {leadStatus === "sent" && (
              <div className="mb-5 rounded-lg border border-white/14 bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#07101e]"><Check className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold text-white">Заявка принята</p>
                    <p className="text-sm text-white/54">Сохранена в WhiteBox и отправлена в Telegram.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" required minLength={2} className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Имя" />
              <Input name="company" className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Компания" />
              <Input name="contact" required className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Email или Telegram" />
              <Input name="business" className="border-white/12 bg-black/28 text-white placeholder:text-white/36" placeholder="Сфера бизнеса" />
              <Textarea name="message" required minLength={10} className="min-h-36 border-white/12 bg-black/28 text-white placeholder:text-white/36 sm:col-span-2" placeholder="Что хотите проверить в пилоте?" />
            </div>
            {leadMessage && (
              <div className={cn("mt-4 rounded-lg border px-4 py-3 text-sm font-medium", leadStatus === "sent" ? "border-white/18 bg-white/10 text-white" : "border-red-400/30 bg-red-500/10 text-red-100")}>
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
            <Link href="/company/register" className="hover:text-white">Company verification</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <Link href="/" className="hover:text-white">TWA app</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
