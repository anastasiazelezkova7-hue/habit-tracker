"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import HeroIllustration from "@/components/hero-illustration";
import { NAV_ITEMS } from "@/lib/constants";

const STEPS = [
  {
    num: "01",
    icon: "Plus",
    title: "Создайте привычку",
    text: "Опишите действие: цель, периодичность, единица измерения и даже «поблажки» — допустимое число пропусков.",
  },
  {
    num: "02",
    icon: "CheckCircle2",
    title: "Отмечайте выполнение",
    text: "Ставьте галочки каждый день. Клик по календарю позволяет честно отметить и прошедшие дни.",
  },
  {
    num: "03",
    icon: "Flame",
    title: "Следите за стриком",
    text: "Привычка не сгорает, если пропуск уложился в лимит. Мотивация «лучше, чем вчера» не даст опустить руки.",
  },
  {
    num: "04",
    icon: "TrendingUp",
    title: "Анализируйте прогресс",
    text: "Тепловые карты, графики выполнения и рейтинг побед показывают, что вы растёте день за днём.",
  },
];

const FEATURES = [
  { icon: "CalendarDays", title: "Календарь-тепловая карта", text: "Годовая и месячная карты показывают % выполнения в цвете бренда." },
  { icon: "PieChart", title: "Статистика по категориям", text: "Круговые и столбчатые диаграммы раскладывают успехи по сферам жизни." },
  { icon: "Flame", title: "Стрики и поблажки", text: "Лимит пропусков в месяц защищает серию — дисциплина без выгорания." },
  { icon: "Sprout", title: "Польза, а не цифры", text: "«320 страниц ≈ 2 книги» — геймификация переводит сухие цифры в пользу." },
  { icon: "Moon", title: "Светлая и тёмная тема", text: "Переключайте оформление — все цвета бренда подстраиваются мгновенно." },
  { icon: "Upload", title: "Экспорт данных", text: "Вы владеете своими данными: вся история выгружается в один JSON-файл." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Шапка */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary px-5 py-2.5 font-display text-base font-bold text-secondary transition-colors hover:bg-primary-strong"
            >
              Открыть приложение
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-8 py-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-wash px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-primary-stronger">
            <span className="h-2 w-2 rounded-full bg-primary-stronger" />
            личный трекер привычек
          </span>
          <h1 className="mt-5 font-display text-6xl font-bold leading-[1.05] text-secondary">
            Выстраивайте{" "}
            <span className="relative inline-block text-primary-stronger">
              дисциплину
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                <path d="M2 9c50-8 146-8 196-3" stroke="#F2A9AA" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            по одной привычке за раз
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Личный инструмент для выстраивания дисциплины: ежедневное
            отслеживание, мотивирующие стрики, наглядная статистика и геймификация —
            в светлом и тёмном оформлении бренда Jolly Lush.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary px-7 py-3.5 font-display text-lg font-bold text-secondary shadow-md transition-transform hover:-translate-y-0.5"
            >
              Начать бесплатно
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-border-strong bg-surface px-7 py-3.5 font-display text-lg font-bold text-secondary transition-colors hover:bg-surface-muted"
            >
              Возможности
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm font-bold text-faint">
            <span>✓ без регистрации</span>
            <span>✓ личные данные локально</span>
            <span>✓ экспорт JSON</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <HeroIllustration />
        </motion.div>
      </section>

      {/* Как это работает */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-8 py-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl font-bold text-secondary">
              Как это работает
            </h2>
            <p className="mt-3 text-muted">
              Четыре простых шага от первой привычки до устойчивой рутины.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="group rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-wash text-primary-stronger transition-transform group-hover:scale-110">
                    <StepIcon name={s.icon} />
                  </span>
                  <span className="font-display text-3xl font-bold text-surface-strong">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-secondary">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section id="features" className="mx-auto w-full max-w-7xl px-8 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold text-secondary">
            Возможности и преимущества
          </h2>
          <p className="mt-3 text-muted">
            Всё продумано, чтобы маленькие шаги превращались в большие изменения.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary text-background">
                <FeatureIcon name={f.icon} />
              </div>
              <h3 className="font-display text-lg font-bold text-secondary">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Пример дашборда */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto w-full max-w-7xl px-8 py-20">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="font-display text-4xl font-bold text-background">
                Вот так выглядит ваш день
              </h2>
              <p className="mt-3 max-w-xl text-background/70">
                Приветствие, прогресс выполнения, мотивация «лучше, чем вчера» и
                привычки с одним кликом — всё в одном окне.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary px-6 py-3 font-display text-base font-bold text-secondary transition-colors hover:bg-primary-strong"
            >
              Открыть дашборд
            </Link>
          </div>
          <DashboardMock />
        </div>
      </section>

      {/* Футер */}
      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-8 py-8 sm:flex-row">
        <Logo />
        <p className="text-sm font-semibold text-faint">
          © {new Date().getFullYear()} Jolly Lush · Привычки
        </p>
        <div className="flex items-center gap-4 text-sm font-bold text-muted">
          {NAV_ITEMS.slice(0, 4).map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-primary-stronger">
              {n.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

function StepIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    Plus: <PlusGlyph />,
    CheckCircle2: <CheckGlyph />,
    Flame: <FlameGlyph />,
    TrendingUp: <TrendGlyph />,
  };
  return <>{icons[name]}</>;
}

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    CalendarDays: <CalendarGlyph />,
    PieChart: <PieGlyph />,
    Flame: <FlameGlyph />,
    Sprout: <SproutGlyph />,
    Moon: <MoonGlyph />,
    Upload: <UploadGlyph />,
  };
  return <>{icons[name]}</>;
}

function PlusGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CheckGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 5-5" />
    </svg>
  );
}
function FlameGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A6.5 6.5 0 0 1 15 8c.5-2.5-1-3-2-4 1 1.5 1.5 3-1 3.5-2.5 1-3.5 3-3.5 7 1.5-.5 2.5-.5 3 0-1.5 2-5 2-3-0z" />
      <path d="M12 19a3 3 0 0 0 3-3c0-1.5-1-3-3-4-2 1-3 2.5-3 4a3 3 0 0 0 3 3z" />
    </svg>
  );
}
function TrendGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}
function CalendarGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M9 15h6" />
    </svg>
  );
}
function PieGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 3a9 9 0 1 0 9 9h-9V3z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" />
    </svg>
  );
}
function SproutGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10M12 20v-6" />
      <path d="M12 14c0-4 2-7 7-7 0 4-2 7-7 7z" />
      <path d="M12 14c0-4-2-7-7-7 0 4 2 7 7 7z" />
    </svg>
  );
}
function MoonGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
function UploadGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M6 10l6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  );
}

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-background/10 bg-surface shadow-lg">
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-error" />
        <span className="h-3 w-3 rounded-full bg-warning" />
        <span className="h-3 w-3 rounded-full bg-success" />
        <span className="ml-4 rounded-lg bg-surface px-3 py-1 text-xs font-bold text-faint">
          привычки · дашборд
        </span>
      </div>
      <div className="flex">
        <div className="hidden w-52 shrink-0 border-r border-border bg-surface p-4 md:block">
          <div className="mb-5 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <SproutGlyph />
            </span>
            <span className="font-display font-bold text-secondary">Привычки</span>
          </div>
          {["Дашборд", "Привычки", "Календарь", "Статистика", "Настройки"].map((n, i) => (
            <div
              key={n}
              className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-bold ${
                i === 0 ? "bg-secondary text-background" : "text-muted"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded bg-current opacity-60" />
              {n}
            </div>
          ))}
          <div className="mt-5 rounded-lg bg-primary px-3 py-2 text-center text-[13px] font-bold text-secondary">
            + Добавить привычку
          </div>
        </div>
        <div className="flex-1 space-y-4 p-5">
          <div>
            <div className="font-display text-xl font-bold text-secondary">
              Доброе утро! Сегодня суббота
            </div>
            <div className="text-xs text-faint">6 сентября 2026</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span className="text-secondary">Выполнено 3 из 5 привычек</span>
              <span className="text-primary-stronger">60%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-strong">
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              { name: "Выпить 2 л воды", icon: "droplet", color: "#5C8D89", done: true },
              { name: "Прочитать 20 страниц", icon: "book", color: "#E76F51", done: true },
              { name: "Медитация 10 минут", icon: "spark", color: "#9B8CBF", done: true },
              { name: "Прогулка 30 минут", icon: "steps", color: "#8AB17D", done: false },
              { name: "Убрать соцсети 1 час", icon: "phone", color: "#E9C46A", done: false },
            ].map((h) => (
              <div
                key={h.name}
                className={`flex items-center gap-2.5 rounded-xl border p-3 ${
                  h.done ? "border-primary/40 bg-primary-wash" : "border-border bg-surface-muted"
                }`}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ backgroundColor: h.color + "22", color: h.color }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    {h.icon === "droplet" && <path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z" />}
                    {h.icon === "book" && <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />}
                    {h.icon === "spark" && <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />}
                    {h.icon === "steps" && <path d="M3 12h4l3-9 4 18 3-9h4" />}
                    {h.icon === "phone" && <rect x="7" y="2" width="10" height="20" rx="2" />}
                  </svg>
                </span>
                <span className="flex-1 truncate text-[13px] font-bold text-secondary">
                  {h.name}
                </span>
                <span className={`grid h-6 w-6 place-items-center rounded-full ${h.done ? "" : "border-2 border-secondary/40"}`}>
                  {h.done && <CheckGlyph />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}