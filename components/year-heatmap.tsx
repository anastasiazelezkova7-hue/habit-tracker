"use client";

import { useMemo, useState } from "react";
import { addDays, eachDayBetween, toISODate } from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

const LEVELS = [
  "#E9E5DF",
  "#FDDDDC",
  "#F7B7B4",
  "#E88E8B",
  "#D1706E",
  "#B25A58",
];

function levelFor(percent: number): number {
  if (percent <= 0) return 0;
  if (percent < 0.2) return 1;
  if (percent < 0.45) return 2;
  if (percent < 0.75) return 3;
  return 4;
}

function scheduled(habit: HabitDTO, day: Date): boolean {
  if (habit.isArchived) return false;
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "CUSTOM_DAYS")
    return (habit.customDays ?? []).includes(day.getDay());
  return true;
}

export default function YearHeatmap({
  habits,
  today,
}: {
  habits: HabitDTO[];
  today: Date;
}) {
  const [yearOffset, setYearOffset] = useState(0);

  const days = useMemo(() => {
    const end = addDays(today, yearOffset * 365);
    const start = addDays(end, -364);
    return eachDayBetween(start, end);
  }, [yearOffset, today]);

  // group days by ISO week columns
  const columns = useMemo(() => {
    const cols: Date[][] = [];
    let cur: Date[] = [];
    let lastWeek: string | null = null;
    for (const d of days) {
      const monday = addDays(d, -((d.getDay() + 6) % 7));
      const wk = toISODate(monday);
      if (cols.length === 0 || wk !== lastWeek) {
        if (cur.length) cols.push(cur);
        cur = [];
        lastWeek = wk;
      }
      cur.push(d);
    }
    if (cur.length) cols.push(cur);
    return cols;
  }, [days]);

  const active = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  const statsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of days) {
      const key = toISODate(d);
      const forDay = active.filter((h) => scheduled(h, d));
      if (!forDay.length) {
        map.set(key, -1);
        continue;
      }
      const done = forDay.filter((h) =>
        h.logs.some((l) => l.date === key && l.isCompleted),
      ).length;
      map.set(key, done / forDay.length);
    }
    return map;
  }, [days, active]);

  const totalCompletions = useMemo(
    () =>
      active.reduce(
        (s, h) => s + h.logs.filter((l) => l.isCompleted).length,
        0,
      ),
    [active],
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-secondary">
          Прогресс за год
        </h2>
        <div className="flex items-center gap-2 text-sm font-bold text-muted">
          <button
            type="button"
            onClick={() => setYearOffset((v) => v - 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-border-strong"
            aria-label="Предыдущий год"
          >
            ‹
          </button>
          <span className="min-w-16 text-center">
            {new Date(today).getFullYear() + yearOffset}
          </span>
          <button
            type="button"
            onClick={() => setYearOffset((v) => v + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-border-strong"
            aria-label="Следующий год"
          >
            ›
          </button>
          {yearOffset !== 0 && (
            <button
              type="button"
              onClick={() => setYearOffset(0)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs"
            >
              Текущий
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col justify-between py-0.5 text-[10px] font-bold text-faint">
          <span>Пн</span>
          <span></span>
          <span>Ср</span>
          <span></span>
          <span>Пт</span>
          <span></span>
          <span>Вс</span>
        </div>
        <div className="flex gap-1">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, r) => {
                const d = col[r];
                if (!d) return <div key={r} className="h-[13px] w-[13px]" />;
                const key = toISODate(d);
                const pct = statsByDay.get(key) ?? -1;
                const lvl = pct < 0 ? 0 : levelFor(pct);
                return (
                  <div
                    key={key}
                    title={`${d.getDate()}.${d.getMonth() + 1} — ${pct < 0 ? "нет привычек" : `${Math.round(pct * 100)}%`}`}
                    className="h-[13px] w-[13px] rounded-[3px]"
                    style={{ backgroundColor: LEVELS[lvl] }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-faint">
          Меньше
          {LEVELS.map((c) => (
            <span key={c} className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: c }} />
          ))}
          Больше
        </div>
        <span className="text-xs font-bold text-muted">
          {totalCompletions} {plural(totalCompletions)} за год
        </span>
      </div>
    </div>
  );
}

function plural(n: number) {
  const abs = Math.abs(n);
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return "отметка";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "отметки";
  return "отметок";
}