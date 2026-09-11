"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "./app-context";
import {
  addDays,
  daysInMonth,
  isSameDay,
  monthGenitiveRu,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  formatRuDayShort,
} from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

export default function MiniCalendar({
  habit,
  anchor,
}: {
  habit: HabitDTO;
  anchor: Date;
}) {
  const { toggleLog, removeLog, notify } = useApp();
  const [month, setMonth] = useState(() => startOfMonth(anchor));
  const today = startOfDay(new Date());

  const logs = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const l of habit.logs) if (l.isCompleted) m.set(l.date, true);
    return m;
  }, [habit.logs]);

  const days = useMemo(() => {
    const first = startOfWeek(month);
    const count = 42;
    return Array.from({ length: count }, (_, i) => addDays(first, i));
  }, [month]);

  const handleDay = async (d: Date) => {
    const key = toISODate(d);
    if (logs.has(key)) {
      await removeLog(habit.id, key);
      notify("Отметка снята", "info");
    } else {
      await toggleLog(habit.id, key, true);
      notify("Выполнено!", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.16 }}
      className="w-[264px] rounded-2xl border border-border bg-surface p-3 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(addDays(month, -daysInMonth(month)))}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-muted"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display text-sm font-bold capitalize text-secondary">
          {monthGenitiveRu(month.getMonth())} {month.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() =>
            setMonth(addDays(month, daysInMonth(month)))
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-muted"
          aria-label="Следующий месяц"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <span
            key={d}
            className="py-1 text-[11px] font-bold text-faint"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="popLayout">
          {days.map((d) => {
            const key = toISODate(d);
            const done = logs.has(key);
            const inMonth = d.getMonth() === month.getMonth();
            const isToday = isSameDay(d, today);
            const isFuture = d > addDays(today, 0);
            return (
              <motion.button
                key={key}
                type="button"
                layout
                disabled={isFuture}
                onClick={() => handleDay(d)}
                title={`${d.getDate()} ${formatRuDayShort(d)}`}
                className={`relative grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition-all disabled:opacity-35 ${
                  done
                    ? "text-white"
                    : inMonth
                      ? "text-muted hover:bg-surface-muted"
                      : "text-faint/50 hover:bg-surface-muted"
                }`}
                style={done ? { backgroundColor: habit.color } : undefined}
              >
                {d.getDate()}
                {isToday && !done && (
                  <span className="absolute inset-1.5 rounded-lg border-2 border-primary" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}