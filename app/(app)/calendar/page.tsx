"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/components/app-context";
import Icon from "@/components/icon";
import Drawer from "@/components/drawer";
import HabitToggle from "@/components/habit-toggle";
import {
  addDays,
  daysInMonth,
  isSameDay,
  monthNameRu,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
} from "@/lib/dates";
import { heatmapColor } from "@/lib/metrics";
import type { HabitDTO } from "@/lib/types";

function isScheduled(habit: HabitDTO, day: Date): boolean {
  if (habit.isArchived) return false;
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "CUSTOM_DAYS")
    return (habit.customDays ?? []).includes(day.getDay());
  return true;
}

export default function CalendarPage() {
  const { habits } = useApp();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState<Date | null>(null);

  const active = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  const weekStart = useMemo(() => startOfWeek(month), [month]);
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const completedByDay = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    for (const day of cells) {
      const key = toISODate(day);
      const forDay = active.filter((h) => isScheduled(h, day));
      const done = forDay.filter((h) =>
        h.logs.some((l) => l.date === key && l.isCompleted),
      ).length;
      map.set(key, { done, total: forDay.length });
    }
    return map;
  }, [cells, active]);

  const selectedKey = selected ? toISODate(selected) : null;
  const selectedDayHabits = useMemo(() => {
    if (!selected) return [];
    return active
      .filter((h) => isScheduled(h, selected))
      .map((h) => ({
        habit: h,
        done: h.logs.some((l) => l.date === selectedKey && l.isCompleted),
      }));
  }, [active, selected, selectedKey]);

  const goPrev = () => setMonth(addDays(month, -daysInMonth(month)));
  const goNext = () => setMonth(addDays(month, daysInMonth(month)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold text-secondary">
          Календарь
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition-colors hover:border-border-strong"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-40 text-center font-display text-xl font-bold text-secondary">
            {monthNameRu(month.getMonth())} {month.getFullYear()}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition-colors hover:border-border-strong"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(today))}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-muted transition-colors hover:border-border-strong"
          >
            Сегодня
          </button>
        </div>
      </div>

      {/* Легенда heatmap */}
      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-faint">
        Меньше
        {["#EFE8E0", "#FCD5D2", "#F7A6A1", "#E87D72", "#C75B5B"].map((c) => (
          <span
            key={c}
            className="h-4 w-4 rounded-md"
            style={{ backgroundColor: c }}
          />
        ))}
        Больше
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-surface-muted">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div
              key={d}
              className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-faint"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day) => {
            const key = toISODate(day);
            const { done, total } = completedByDay.get(key) ?? { done: 0, total: 0 };
            const percent = total > 0 ? done / total : 0;
            const inMonth = day.getMonth() === month.getMonth();
            const isToday = isSameDay(day, today);
            const isFuture = day > today;
            const isSelected = isSameDay(day, selected ?? today);
            const color =
              total === 0
                ? "var(--background)"
                : heatmapColor(percent);

            return (
              <button
                key={key}
                type="button"
                disabled={isFuture}
                onClick={() => setSelected(day)}
                className={`relative flex aspect-square min-h-[92px] flex-col items-center justify-center gap-1 border-b border-r border-border/60 p-2 transition-all last:border-r-0 hover:z-10 hover:ring-2 hover:ring-primary/60 ${
                  inMonth ? "" : "opacity-40"
                } disabled:cursor-not-allowed disabled:opacity-25`}
                style={isFuture ? undefined : { backgroundColor: color }}
              >
                {isToday && (
                  <span className="absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-primary-stronger" />
                )}
                <span
                  className={`text-sm font-bold ${
                    percent > 0.55 && !isToday
                      ? "text-white"
                      : "text-secondary"
                  }`}
                >
                  {day.getDate()}
                </span>
                {total > 0 && (
                  <span
                    className={`text-[11px] font-bold ${
                      percent > 0.55 && !isToday
                        ? "text-white/85"
                        : "text-muted"
                    }`}
                  >
                    {done}/{total}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute inset-2 rounded-xl border-2 border-secondary/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `${selected.getDate()} ${monthNameRu(selected.getMonth()).toLowerCase()}`
            : ""
        }
      >
        {selected && (
          <div className="space-y-3">
            {selectedDayHabits.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Icon name="CalendarDays" size={32} className="text-faint" />
                <p className="mt-3 text-sm text-muted">
                  На этот день привычки не запланированы.
                </p>
              </div>
            ) : (
              selectedDayHabits.map(({ habit, done }) => (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                    done ? "border-primary/40 bg-primary-wash" : "border-border bg-surface-muted"
                  }`}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: habit.color + "22", color: habit.color }}
                  >
                    <Icon name={habit.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-secondary">
                      {habit.name}
                    </div>
                    <div className="text-xs font-semibold text-faint">
                      {habit.targetValue} {habit.unit || "раз"}
                    </div>
                  </div>
                  <HabitToggle habit={habit} date={selected} size="sm" />
                </div>
              ))
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}