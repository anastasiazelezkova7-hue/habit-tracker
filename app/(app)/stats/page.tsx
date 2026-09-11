"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trophy, CalendarCheck, Award, Flame } from "lucide-react";
import { useApp } from "@/components/app-context";
import YearHeatmap from "@/components/year-heatmap";
import Icon from "@/components/icon";
import {
  addDays,
  eachDayBetween,
  startOfDay,
  startOfWeek,
  toISODate,
} from "@/lib/dates";
import { currentStreakDays, toHabitLike } from "@/lib/metrics";
import { pluralize } from "@/lib/constants";
import type { HabitDTO } from "@/lib/types";

const AXIS = "#5C7274";
const GRID = "#D5CEC5";

function scheduled(habit: HabitDTO, day: Date) {
  if (habit.isArchived) return false;
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "CUSTOM_DAYS")
    return (habit.customDays ?? []).includes(day.getDay());
  return true;
}

export default function StatsPage() {
  const { habits, loading } = useApp();
  const today = useMemo(() => startOfDay(new Date()), []);
  const active = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  const year = useMemo(() => eachDayBetween(addDays(today, -364), today), [today]);

  const dayStats = useMemo(() => {
    const map = new Map<string, { done: number; total: number; key: string }>();
    for (const day of year) {
      const key = toISODate(day);
      const forDay = active.filter((h) => scheduled(h, day));
      const done = forDay.filter((h) =>
        h.logs.some((l) => l.date === key && l.isCompleted),
      ).length;
      map.set(key, { done, total: forDay.length, key });
    }
    return map;
  }, [year, active]);

  const weekdayStats = useMemo(() => {
    const arr = Array.from({ length: 7 }, () => 0);
    for (const s of dayStats.values()) {
      const day = new Date(s.key + "T00:00:00");
      arr[day.getDay()] += s.done;
    }
    const names = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return names.map((name, i) => ({ name, completions: arr[i] }));
  }, [dayStats]);

  const categoryStats = useMemo(() => {
    const byCat = new Map<string, { name: string; color: string; value: number }>();
    for (const h of active) {
      const total = h.logs.filter((l) => l.isCompleted).length;
      if (total === 0) continue;
      const c = h.category;
      const cur = byCat.get(c.id) ?? { name: c.name, color: c.color, value: 0 };
      cur.value += total;
      byCat.set(c.id, cur);
    }
    return [...byCat.values()].sort((a, b) => b.value - a.value);
  }, [active]);

  const ranking = useMemo(() => {
    return active
      .map((h) => {
        const keys = new Set(h.logs.filter((l) => l.isCompleted).map((l) => l.date));
        return {
          habit: h,
          total: keys.size,
          streak: currentStreakDays(toHabitLike(h), keys, today),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [active, today]);

  const bestRecords = useMemo(() => {
    let bestDay: { date: string; pct: number } | null = null;
    for (const s of dayStats.values()) {
      if (s.total === 0) continue;
      const pct = s.done / s.total;
      if (!bestDay || pct > bestDay.pct) bestDay = { date: s.key, pct };
    }

    // weeks
    let bestWeek: { label: string; pct: number; done: number; total: number } | null = null;
    const weekMap = new Map<string, { start: string; done: number; total: number }>();
    for (const day of year) {
      const ws = toISODate(startOfWeek(day));
      const s = dayStats.get(toISODate(day))!;
      const cur = weekMap.get(ws) ?? { start: ws, done: 0, total: 0 };
      cur.done += s.done;
      cur.total += s.total;
      weekMap.set(ws, cur);
    }
    for (const w of weekMap.values()) {
      if (w.total === 0) continue;
      const pct = w.done / w.total;
      if (!bestWeek || pct > bestWeek.pct) bestWeek = { label: w.start, pct, done: w.done, total: w.total };
    }

    // months
    let bestMonth: { label: string; pct: number } | null = null;
    const monthMap = new Map<string, { label: string; done: number; total: number }>();
    for (const day of year) {
      const mk = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}`;
      const s = dayStats.get(toISODate(day))!;
      const cur = monthMap.get(mk) ?? { label: mk, done: 0, total: 0 };
      cur.done += s.done;
      cur.total += s.total;
      monthMap.set(mk, cur);
    }
    for (const m of monthMap.values()) {
      if (m.total === 0) continue;
      const pct = m.done / m.total;
      if (!bestMonth || pct > bestMonth.pct) bestMonth = { label: m.label, pct };
    }

    return { bestDay, bestWeek, bestMonth };
  }, [dayStats, year]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const fmtMonth = (iso: string) => {
    const [y, m] = iso.split("-");
    return `${["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"][Number(m) - 1]} ${y}`;
  };

  const maxWeekday = Math.max(...weekdayStats.map((w) => w.completions), 1);
  const totalCompletions = useMemo(
    () => active.reduce((s, h) => s + h.logs.filter((l) => l.isCompleted).length, 0),
    [active],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-strong" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-strong" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-strong" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold text-secondary">
          Статистика
        </h1>
        <p className="mt-1 text-muted">
          {totalCompletions} {pluralize(totalCompletions, "выполненная отметка", "выполненные отметки", "выполненных отметок")} за всё время
        </p>
      </div>

      <YearHeatmap habits={habits} today={today} />

      {/* Лучшие результаты */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-muted">
            <CalendarCheck size={17} className="text-accent" />
            Лучший день
          </div>
          {bestRecords.bestDay ? (
            <>
              <div className="font-display text-2xl font-bold text-secondary">
                {fmtDate(bestRecords.bestDay.date)}
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-stronger">
                {Math.round(bestRecords.bestDay.pct * 100)}%
              </div>
              <p className="mt-1 text-xs text-faint">выполнение дня</p>
            </>
          ) : (
            <p className="text-sm text-faint">Нет данных</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-muted">
            <Award size={17} className="text-warning" />
            Лучшая неделя
          </div>
          {bestRecords.bestWeek ? (
            <>
              <div className="font-display text-2xl font-bold text-secondary">
                {fmtDate(bestRecords.bestWeek.label)}
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-stronger">
                {Math.round(bestRecords.bestWeek.pct * 100)}%
              </div>
              <p className="mt-1 text-xs text-faint">
                {bestRecords.bestWeek.done} из {bestRecords.bestWeek.total} за неделю
              </p>
            </>
          ) : (
            <p className="text-sm text-faint">Нет данных</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-muted">
            <Flame size={17} className="text-primary-stronger" />
            Лучший месяц
          </div>
          {bestRecords.bestMonth ? (
            <>
              <div className="font-display text-2xl font-bold text-secondary">
                {fmtMonth(bestRecords.bestMonth.label)}
              </div>
              <div className="mt-1 text-2xl font-bold text-primary-stronger">
                {Math.round(bestRecords.bestMonth.pct * 100)}%
              </div>
              <p className="mt-1 text-xs text-faint">выполнение месяца</p>
            </>
          ) : (
            <p className="text-sm text-faint">Нет данных</p>
          )}
        </div>
      </div>

      {/* Рейтинг привычек */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-secondary">
          <Trophy size={20} className="text-warning" />
          Самые успешные привычки
        </h2>
        <div className="space-y-3">
          {ranking.length === 0 ? (
            <p className="text-sm text-faint">
              Отмечайте привычки — здесь появится рейтинг ваших побед.
            </p>
          ) : (
            ranking.map(({ habit, total, streak }, i) => (
              <div key={habit.id} className="flex items-center gap-4">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-warning/20 text-warning"
                      : "bg-surface-strong text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: habit.color + "22", color: habit.color }}
                >
                  <Icon name={habit.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-secondary">{habit.name}</div>
                  <div className="text-xs font-semibold text-faint">
                    {total} {pluralize(total, "отметка", "отметки", "отметок")}
                    {streak > 0 && ` · стрик ${streak} ${pluralize(streak, "день", "дня", "дней")}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Диаграммы */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold text-secondary">
            Отметки по категориям
          </h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-faint">Нет данных для диаграммы.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {categoryStats.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} отметок`, name]}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E6E1DB",
                    borderRadius: 12,
                    fontWeight: 700,
                    color: "#17383C",
                  }}
                />
                <Legend
                  formatter={(v: string) => <span style={{ color: AXIS, fontWeight: 700 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl font-bold text-secondary">
            Отметки по дням недели
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekdayStats} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: AXIS, fontSize: 12, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: AXIS, fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={34}
              />
              <Tooltip
                cursor={{ fill: "#F2A9AA22" }}
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E1DB",
                  borderRadius: 12,
                  fontWeight: 700,
                  color: "#17383C",
                }}
              />
              <Bar
                dataKey="completions"
                name="Отметки"
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
              >
                {weekdayStats.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.completions === maxWeekday ? "#D1706E" : "#E8B4A2"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}