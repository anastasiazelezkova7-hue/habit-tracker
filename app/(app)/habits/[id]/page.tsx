"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useApp } from "@/components/app-context";
import Icon from "@/components/icon";
import LineChart from "@/components/line-chart";
import StreakBadge from "@/components/streak-badge";
import ProgressBar from "@/components/progress-bar";
import {
  bestStreakDays,
  completionRate,
  currentStreakDays,
  missesThisMonth,
  toHabitLike,
} from "@/lib/metrics";
import { pluralize, WEEKDAYS } from "@/lib/constants";
import { startOfDay, toISODate } from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

function frequencyLabel(h: HabitDTO): string {
  if (h.frequencyType === "DAILY") return "Ежедневно";
  if (h.frequencyType === "WEEKLY")
    return `${h.targetValue} ${pluralize(h.targetValue, "раз", "раза", "раз")} в неделю`;
  return (h.customDays ?? [])
    .map((d) => WEEKDAYS.find((w) => w.index === d)?.full)
    .join(", ");
}

export default function HabitDetailPage() {
  const params = useParams<{ id: string }>();
  const { habits, loading } = useApp();
  const today = useMemo(() => startOfDay(new Date()), []);

  const habit = useMemo(
    () => habits.find((h) => h.id === params.id),
    [habits, params.id],
  );

  const stats = useMemo(() => {
    if (!habit) return null;
    const keys = new Set(
      habit.logs.filter((l) => l.isCompleted).map((l) => l.date),
    );
    const m = toHabitLike(habit);
    return {
      current: currentStreakDays(m, keys, today),
      best: bestStreakDays(m, keys, today),
      rate7: completionRate(m, keys, today, 7),
      rate15: completionRate(m, keys, today, 15),
      rate30: completionRate(m, keys, today, 30),
      usedMisses: missesThisMonth(m, keys, today),
      totalLogs: habit.logs.filter((l) => l.isCompleted).length,
    };
  }, [habit, today]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-strong" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-strong" />
      </div>
    );
  }

  if (!habit) notFound();

  const todayKey = toISODate(today);
  const doneToday = habit.logs.some(
    (l) => l.date === todayKey && l.isCompleted,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/habits"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Все привычки
      </Link>

      <div className="flex items-center gap-4">
        <span
          className="grid h-16 w-16 place-items-center rounded-2xl"
          style={{ backgroundColor: habit.color + "22", color: habit.color }}
        >
          <Icon name={habit.icon} size={30} />
        </span>
        <div>
          <h1 className="font-display text-4xl font-bold text-secondary">
            {habit.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-faint">
            <span style={{ color: habit.category.color }}>
              {habit.category.name}
            </span>
            <span>·</span>
            <span>{frequencyLabel(habit)}</span>
            <span>·</span>
            <span>
              цель: {habit.targetValue} {habit.unit || "раз"}
            </span>
          </div>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <StreakBadge streak={stats!.current} size="lg" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <StreakBadge streak={stats!.best} size="lg" best />
        </div>
        {[7, 15, 30].map((n) => {
          const rate = stats![`rate${n}` as "rate7" | "rate15" | "rate30"];
          return (
            <div
              key={n}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-bold text-muted">
                  Выполнение · {n} дней
                </span>
                <span className="font-display text-xl font-bold text-primary-stronger">
                  {Math.round(rate * 100)}%
                </span>
              </div>
              <ProgressBar value={rate} max={1} />
            </div>
          );
        })}
      </div>

      {/* График */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-secondary">
            Выполнение по дням
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              doneToday
                ? "bg-accent-soft text-accent"
                : "bg-primary-wash text-primary-stronger"
            }`}
          >
            <Icon name={doneToday ? "Check" : "Zap"} size={13} />
            {doneToday ? "Сегодня выполнено" : "Сегодня ещё не отмечено"}
          </span>
        </div>
        <LineChart habit={habit} />
      </div>

      {/* Сводка */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="mb-2 font-display text-lg font-bold text-secondary">
            Всего отметок
          </h3>
          <p className="font-display text-4xl font-bold text-primary-stronger">
            {stats!.totalLogs}
          </p>
          <p className="mt-1 text-sm text-faint">
            {pluralize(stats!.totalLogs, "выполненная отметка", "выполненные отметки", "выполненных отметок")} за всё время
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="mb-2 font-display text-lg font-bold text-secondary">
            Пропуски в этом месяце
          </h3>
          {habit.monthlyMissesAllowed > 0 ? (
            <>
              <p className="font-display text-4xl font-bold text-primary-stronger">
                {stats!.usedMisses} / {habit.monthlyMissesAllowed}
              </p>
              <p className="mt-1 text-sm text-faint">
                {stats!.usedMisses >= habit.monthlyMissesAllowed
                  ? "Лимит исчерпан — следующий пропуск сожжёт стрик"
                  : "Пропуск в пределах лимита не сжигает стрик"}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-4xl font-bold text-primary-stronger">
                {stats!.usedMisses}
              </p>
              <p className="mt-1 text-sm text-faint">
                Поблажки отключены для этой привычки
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}