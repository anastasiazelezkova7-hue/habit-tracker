"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArchiveRestore, Archive, Plus, Trash2, Pencil, MoreVertical } from "lucide-react";
import { useApp } from "@/components/app-context";
import Icon from "@/components/icon";
import ConfirmDialog from "@/components/confirm-dialog";
import EmptyState from "@/components/empty-state";
import { del, patch } from "@/lib/client";
import {
  currentStreakDays,
  missesThisMonth,
  remainingMisses,
  toHabitLike,
} from "@/lib/metrics";
import { pluralize, WEEKDAYS } from "@/lib/constants";
import { startOfDay } from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

function frequencyLabel(h: HabitDTO): string {
  if (h.frequencyType === "DAILY") return "Ежедневно";
  if (h.frequencyType === "WEEKLY")
    return `${h.targetValue} ${pluralize(h.targetValue, "раз", "раза", "раз")} в неделю`;
  const days = (h.customDays ?? [])
    .map((d) => WEEKDAYS.find((w) => w.index === d)?.short)
    .join(", ");
  return `По дням: ${days}`;
}

export default function HabitsPage() {
  const { habits, loading, openCreate, refresh, notify } = useApp();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<HabitDTO | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  const list = useMemo(() => {
    const filtered = habits.filter((h) =>
      tab === "active" ? !h.isArchived : h.isArchived,
    );
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [habits, tab]);

  const toggleArchive = async (h: HabitDTO) => {
    try {
      await patch(`/api/habits/${h.id}`, { isArchived: !h.isArchived });
      notify(
        h.isArchived ? "Привычка восстановлена" : "Привычка отправлена в архив",
        "success",
      );
      await refresh();
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await del(`/api/habits/${toDelete.id}`);
      notify("Привычка удалена", "success");
      await refresh();
      setToDelete(null);
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const label = tab === "active" ? "Активные" : "Архивные";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold text-secondary">
          Привычки
        </h1>
        <button
          type="button"
          onClick={() => openCreate()}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-base font-bold text-secondary transition-colors hover:bg-primary-strong"
        >
          <Plus size={18} />
          Новая привычка
        </button>
      </div>

      {/* Табы */}
      <div className="inline-flex rounded-xl border border-border bg-surface p-1">
        {(["active", "archived"] as const).map((t) => {
          const count = habits.filter((h) =>
            t === "active" ? !h.isArchived : h.isArchived,
          ).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-bold transition-colors ${
                tab === t
                  ? "bg-secondary text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t === "active" ? "Активные" : "Архивные"} · {count}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-strong" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={tab === "active" ? "Sprout" : "Archive"}
          title={tab === "active" ? "Пока нет привычек" : "Архив пуст"}
          subtitle={
            tab === "active"
              ? "Создайте первую привычку и начните путь к дисциплине."
              : "Привычки, которые вы архивируете, будут появляться здесь."
          }
          action={
            tab === "active" ? (
              <button
                type="button"
                onClick={() => openCreate()}
                className="rounded-xl bg-primary px-6 py-3 font-display font-bold text-secondary transition-colors hover:bg-primary-strong"
              >
                Создать привычку
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm font-semibold text-faint">
            {list.length} {pluralize(list.length, "привычка", "привычки", "привычек")} ·{" "}
            {label.toLowerCase()}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((h, i) => {
              const keys = new Set(
                h.logs.filter((l) => l.isCompleted).map((l) => l.date),
              );
              const metricHabit = toHabitLike(h);
              const streak = currentStreakDays(metricHabit, keys, today);
              const missesLeft = remainingMisses(metricHabit, keys, today);
              const usedThisMonth = missesThisMonth(metricHabit, keys, today);
              const overdue = h.monthlyMissesAllowed > 0 && usedThisMonth > h.monthlyMissesAllowed;
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                      style={{ backgroundColor: h.color + "22", color: h.color }}
                    >
                      <Icon name={h.icon} size={26} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/habits/${h.id}`}
                        className="truncate font-display text-xl font-bold text-secondary transition-colors hover:text-primary-stronger"
                      >
                        {h.name}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-semibold text-faint">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: h.category.color }}
                        >
                          <Icon name={h.category.icon} size={13} />
                          {h.category.name}
                        </span>
                        <span>·</span>
                        <span>{frequencyLabel(h)}</span>
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setMenuFor(menuFor === h.id ? null : h.id)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-muted hover:text-muted"
                        aria-label="Действия"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {menuFor === h.id && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              openCreate(h);
                              setMenuFor(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted"
                          >
                            <Pencil size={15} /> Редактировать
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toggleArchive(h);
                              setMenuFor(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted"
                          >
                            {h.isArchived ? (
                              <>
                                <ArchiveRestore size={15} /> Восстановить
                              </>
                            ) : (
                              <>
                                <Archive size={15} /> В архив
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setToDelete(h);
                              setMenuFor(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-error hover:bg-primary-wash"
                          >
                            <Trash2 size={15} /> Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary-stronger">
                        <Icon name="Flame" size={18} />
                      </span>
                      <div>
                        <span className="font-display text-2xl font-bold leading-none text-secondary">
                          {streak}
                        </span>
                        <span className="ml-1.5 text-xs font-semibold text-faint">
                          {streak > 0
                            ? `${pluralize(streak, "день", "дня", "дней")} подряд`
                            : "старт сегодня"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 ${
                        h.monthlyMissesAllowed > 0 ? "" : "opacity-50"
                      }`}
                      title="Поблажки: пропуски в пределах лимита не сжигают стрик"
                    >
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          overdue
                            ? "bg-primary-wash text-error"
                            : "bg-accent-soft text-accent"
                        }`}
                      >
                        <Icon name="HeartHandshake" size={17} />
                      </span>
                      <div>
                        <span className="font-display text-2xl font-bold leading-none text-secondary">
                          {missesLeft}
                        </span>
                        <span className="ml-1.5 text-xs font-semibold text-faint">
                          {overdue ? "лимит превышен" : "пропусков осталось"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить привычку?"
        message={`«${toDelete?.name}» будет удалена вместе со всей историей. Это действие нельзя отменить.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}