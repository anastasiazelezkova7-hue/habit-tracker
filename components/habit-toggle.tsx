"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CalendarDays, Check } from "lucide-react";
import { useApp } from "./app-context";
import MiniCalendar from "./mini-calendar";
import { toISODate } from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

export default function HabitToggle({
  habit,
  date,
  size = "md",
  onToggle,
}: {
  habit: HabitDTO;
  date: Date;
  size?: "sm" | "md" | "lg";
  onToggle?: (done: boolean) => void;
}) {
  const { toggleLog, removeLog, notify } = useApp();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const key = toISODate(date);
  const log = habit.logs.find((l) => l.date === key);
  const done = !!log && log.isCompleted;

  const dims =
    size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-9 w-9";

  const handleClick = async () => {
    try {
      if (done) {
        await removeLog(habit.id, key);
        notify("Отметка снята", "info");
        onToggle?.(false);
      } else {
        await toggleLog(habit.id, key, true);
        notify("Выполнено!", "success");
        onToggle?.(true);
      }
    } catch {
      /* handled in provider */
    }
  };

  return (
    <div ref={wrapRef} className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`grid ${dims} place-items-center rounded-full border-2 transition-all ${
          done
            ? "border-transparent shadow-sm"
            : "border-secondary/40 bg-surface hover:border-secondary hover:bg-secondary-soft"
        }`}
        style={done ? { backgroundColor: habit.color } : undefined}
        aria-label={done ? "Снять отметку" : "Отметить выполненным"}
        aria-pressed={done}
      >
        {done && <Check size={size === "lg" ? 24 : 20} className="text-white" strokeWidth={3} />}
      </button>

      <button
        type="button"
        onClick={() => setCalendarOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-muted hover:text-muted"
        title="Отметить за другой день"
        aria-label="Отметить за другой день (мини-календарь)"
      >
        <CalendarDays size={16} />
      </button>

      <AnimatePresence>
        {calendarOpen && (
          <div className="absolute left-0 top-full z-40 mt-2">
            <div
              className="fixed inset-0 z-40"
              onClick={() => setCalendarOpen(false)}
            />
            <div className="relative z-50">
              <MiniCalendar habit={habit} anchor={date} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}