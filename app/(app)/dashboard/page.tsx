"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sprout, TrendingUp } from "lucide-react";
import { useApp } from "@/components/app-context";
import Icon from "@/components/icon";
import HabitToggle from "@/components/habit-toggle";
import ProgressBar from "@/components/progress-bar";
import EmptyState from "@/components/empty-state";
import {
  addDays,
  formatRuFullDate,
  getGreeting,
  startOfDay,
  toISODate,
} from "@/lib/dates";
import {
  buildMotivation,
  currentStreakDays,
  toHabitLike,
} from "@/lib/metrics";
import { getBenefit } from "@/lib/benefits";
import { pluralize } from "@/lib/constants";
import type { HabitDTO } from "@/lib/types";

const USER_NAME_KEY = "jolly-lush-user-name";

function isDueToday(habit: HabitDTO, today: Date): boolean {
  if (habit.isArchived) return false;
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "CUSTOM_DAYS")
    return (habit.customDays ?? []).includes(today.getDay());
  return true; // WEEKLY — можно выполнять в любой день
}

function QuickAdd({ onDone }: { onDone: () => void }) {
  const { categories, refresh, notify, openCreate } = useApp();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId: categories[0]?.id ?? "",
          icon: "Check",
          color: "#5C8D89",
          frequencyType: "DAILY",
          targetValue: 1,
          unit: "",
          reminderTime: null,
          monthlyMissesAllowed: 0,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Ошибка");
      }
      setValue("");
      setOpen(false);
      notify("Привычка добавлена", "success");
      await refresh();
      onDone();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong py-3 text-sm font-bold text-faint transition-colors hover:border-primary hover:text-primary-stronger"
        >
          <Plus size={18} />
          Быстрое добавление привычки
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Что добавить? Например: Медитация 10 минут"
            className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setValue("");
              }}
              className="text-sm font-bold text-faint hover:text-muted"
            >
              Отмена
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openCreate()}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted transition-colors hover:border-border-strong"
              >
                Полная форма
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-secondary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Добавить
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { habits, loading, openCreate } = useApp();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(localStorage.getItem(USER_NAME_KEY) ?? "");
  }, []);

  const schedule = useMemo(
    () => habits.filter((h) => isDueToday(h, today)),
    [habits, today],
  );

  const completed = useMemo(() => {
    const byHabit = new Map<string, Set<string>>();
    for (const h of habits) {
      byHabit.set(
        h.id,
        new Set(h.logs.filter((l) => l.isCompleted).map((l) => l.date)),
      );
    }
    return byHabit;
  }, [habits]);

  const todayKey = toISODate(today);
  const yesterdayKey = toISODate(addDays(today, -1));

  const todayDone = useMemo(
    () => schedule.filter((h) => completed.get(h.id)?.has(todayKey)).length,
    [schedule, completed, todayKey],
  );
  const yesterdayDone = useMemo(
    () =>
      habits.filter(
        (h) =>
          !h.isArchived &&
          h.logs.some((l) => l.date === yesterdayKey && l.isCompleted),
      ).length,
    [habits, yesterdayKey],
  );

  const motivation = useMemo(
    () =>
      buildMotivation(
        todayDone,
        schedule.length,
        yesterdayDone,
        habits.length,
      ),
    [todayDone, schedule.length, yesterdayDone, habits.length],
  );

  const benefits = useMemo(() => {
    const from = addDays(today, -29);
    const fromKey = toISODate(from);
    return habits
      .filter(
        (h) =>
          !h.isArchived && h.unit && h.logs.length > 0,
      )
      .map((h) => {
        const total = h.logs
          .filter((l) => l.date >= fromKey && l.isCompleted)
          .reduce((s, l) => s + (l.value || 1), 0);
        return { habit: h, total, benefit: getBenefit(h.unit, total) };
      })
      .filter((x) => x.benefit)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [habits, today]);

  const progress = schedule.length > 0 ? todayDone / schedule.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold text-secondary">
          {getGreeting()}
          {userName ? `, ${userName}` : ""}!
        </h1>
        <p className="mt-1 text-muted">{formatRuFullDate(today)}</p>
      </div>

      {/* Прогресс дня */}
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-display text-xl font-bold text-secondary">
                Выполнено {todayDone} из {schedule.length}{" "}
                {pluralize(schedule.length, "привычки", "привычек", "привычек")}
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {schedule.length === 0
                  ? "На сегодня расписания нет"
                  : progress === 1
                    ? "Все цели на сегодня закрыты. Браво!"
                    : `Осталось ${schedule.length - todayDone}`}
              </p>
            </div>
            <span className="font-display text-3xl font-bold text-primary-stronger">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <ProgressBar value={todayDone} max={schedule.length} className="h-4" />
        </motion.div>

        {/* Мотивация */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`flex flex-col justify-center rounded-2xl border p-6 shadow-sm ${
            motivation.tone === "good"
              ? "border-primary/50 bg-primary-wash"
              : motivation.tone === "bad"
                ? "border-error/40 bg-primary-wash"
                : "border-border bg-surface"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-2xl shadow-sm">
              {motivation.emoji}
            </span>
            <div>
              <div className="text-sm font-extrabold uppercase tracking-wide text-primary-stronger">
                Лучше, чем вчера
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-muted">
                <TrendingUp size={13} />
                вчера {yesterdayDone} · сегодня {todayDone}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[15px] font-semibold leading-snug text-secondary">
            {motivation.text}
          </p>
        </motion.div>
      </div>

      {/* Список привычек на сегодня */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-secondary">
            Привычки на сегодня
          </h2>
          <button
            type="button"
            onClick={() => openCreate()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-secondary transition-colors hover:bg-primary-strong"
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>

        {loading ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-surface-strong"
              />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <EmptyState
            icon="CalendarDays"
            title="Сегодня расписания нет"
            subtitle="Добавьте привычку с нужной периодичностью, и она появится здесь."
            action={
              <button
                type="button"
                onClick={() => openCreate()}
                className="rounded-xl bg-primary px-6 py-3 font-display font-bold text-secondary transition-colors hover:bg-primary-strong"
              >
                Создать привычку
              </button>
            }
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {schedule.map((habit, i) => {
              const done = completed.get(habit.id)?.has(todayKey);
              const streak = currentStreakDays(
                toHabitLike(habit),
                completed.get(habit.id) ?? new Set<string>(),
                today,
              );
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-colors ${
                    done
                      ? "border-primary/40 bg-primary-wash"
                      : "border-border bg-surface"
                  }`}
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: habit.color + "22", color: habit.color }}
                  >
                    <Icon name={habit.icon} size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-lg font-bold text-secondary">
                      {habit.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-faint">
                      <span>
                        {habit.targetValue}{" "}
                        {habit.unit || ""} · {habit.category.name}
                      </span>
                    </div>
                    {streak > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs font-bold text-primary-stronger">
                        <Icon name="Flame" size={13} />
                        {streak}{" "}
                        {pluralize(streak, "день", "дня", "дней")}
                      </div>
                    )}
                  </div>
                  <HabitToggle habit={habit} date={today} />
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <QuickAdd onDone={() => undefined} />
        </div>
      </section>

      {/* Статистика в виде пользы */}
      {benefits.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold text-secondary">
            <Sprout className="text-success" size={24} />
            Ваша польза за 30 дней
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {benefits.map(({ habit, benefit }) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <span className="text-3xl">{benefit!.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-secondary">
                    {benefit!.text}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-faint">
                    {habit.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}