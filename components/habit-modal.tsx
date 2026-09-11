"use client";

import { useCallback, useState } from "react";
import { Check, Minus, Plus, Sparkles } from "lucide-react";
import Modal from "./modal";
import Icon from "./icon";
import { useApp } from "./app-context";
import { patch, post } from "@/lib/client";
import { FREQUENCY_OPTIONS, HABIT_COLORS, ICON_OPTIONS, WEEKDAYS } from "@/lib/constants";
import type { HabitDTO } from "@/lib/types";

const UNIT_SUGGESTIONS = ["страниц", "минут", "стаканов", "шагов", "км", "раз", "часов"];

export default function HabitModal({
  open,
  habit,
  onClose,
}: {
  open: boolean;
  habit: HabitDTO | null;
  onClose: () => void;
}) {
  const { categories, refresh, notify } = useApp();

  const [name, setName] = useState(habit?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    habit?.categoryId ?? categories[0]?.id ?? "",
  );
  const [icon, setIcon] = useState(habit?.icon ?? "Check");
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0]);
  const [frequencyType, setFrequencyType] =
    useState<HabitDTO["frequencyType"]>(habit?.frequencyType ?? "DAILY");
  const [weeklyCount, setWeeklyCount] = useState(
    habit?.frequencyType === "WEEKLY"
      ? Math.min(7, Math.max(1, habit.targetValue))
      : 3,
  );
  const [customDays, setCustomDays] = useState<number[]>(
    habit?.customDays?.length ? habit.customDays : [1, 3, 5],
  );
  const [targetValue, setTargetValue] = useState(
    habit && habit.frequencyType !== "WEEKLY" ? habit.targetValue : 1,
  );
  const [unit, setUnit] = useState(habit?.unit ?? "");
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime ?? "");
  const [missesAllowed, setMissesAllowed] = useState(
    habit?.monthlyMissesAllowed ?? 0,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = useCallback((idx: number) => {
    setCustomDays((d) =>
      d.includes(idx) ? d.filter((x) => x !== idx) : [...d, idx].sort(),
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название привычки");
      return;
    }
    if (!categoryId) {
      setError("Выберите категорию");
      return;
    }
    if (frequencyType === "CUSTOM_DAYS" && customDays.length === 0) {
      setError("Выберите хотя бы один день недели");
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      icon,
      color,
      frequencyType,
      customDays: frequencyType === "CUSTOM_DAYS" ? customDays : null,
      targetValue:
        frequencyType === "WEEKLY" ? weeklyCount : Math.max(1, targetValue || 1),
      unit: unit.trim(),
      reminderTime: reminderTime || null,
      monthlyMissesAllowed: Math.max(0, missesAllowed || 0),
      isArchived: habit?.isArchived ?? false,
    };

    setSaving(true);
    setError("");
    try {
      if (habit) {
        await patch(`/api/habits/${habit.id}`, payload);
        notify("Привычка обновлена", "success");
      } else {
        await post("/api/habits", payload);
        notify("Привычка добавлена", "success");
      }
      await refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const targetLabel =
    frequencyType === "WEEKLY"
      ? "Сколько раз в неделю"
      : frequencyType === "CUSTOM_DAYS"
        ? "Целевое значение за выбранный день"
        : "Целевое значение за день";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={habit ? "Редактировать привычку" : "Новая привычка"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="rounded-lg bg-primary-wash px-3 py-2 text-sm font-semibold text-primary-stronger">
            {error}
          </p>
        )}

        {/* Название */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted">
            Название
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Выпить 2 литра воды"
            autoFocus
            className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Категория */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted">
            Категория
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  categoryId === c.id
                    ? "border-primary-strong bg-primary-wash text-foreground"
                    : "border-border bg-surface-muted text-muted hover:border-border-strong"
                }`}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: c.color + "22", color: c.color }}
                >
                  <Icon name={c.icon} size={15} />
                </span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Иконка */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted">
            Иконка
          </label>
          <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border bg-surface-muted p-2">
            {ICON_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIcon(n)}
                title={n}
                className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${
                  icon === n
                    ? "bg-secondary text-background"
                    : "text-muted hover:bg-surface-strong hover:text-foreground"
                }`}
              >
                <Icon name={n} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted">
            Цвет
          </label>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
                aria-label={`Цвет ${c}`}
              >
                {color === c && (
                  <Check size={16} className="text-white" strokeWidth={3.2} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Периодичность */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted">
            Периодичность
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequencyType(f.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  frequencyType === f.value
                    ? "border-secondary bg-secondary text-background"
                    : "border-border bg-surface-muted text-muted hover:border-border-strong"
                }`}
              >
                {f.label}
                <span
                  className={`mt-0.5 block text-[11px] font-medium ${
                    frequencyType === f.value ? "text-background/60" : "text-faint"
                  }`}
                >
                  {f.hint}
                </span>
              </button>
            ))}
          </div>

          {frequencyType === "WEEKLY" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-3">
              <span className="text-sm font-semibold text-muted">Цель:</span>
              <button
                type="button"
                onClick={() => setWeeklyCount((v) => Math.max(1, v - 1))}
                className="grid h-8 w-8 place-items-center rounded-lg bg-surface-strong text-muted hover:text-foreground"
              >
                <Minus size={15} />
              </button>
              <span className="w-16 text-center font-display text-xl font-bold text-secondary">
                {weeklyCount}
              </span>
              <button
                type="button"
                onClick={() => setWeeklyCount((v) => Math.min(7, v + 1))}
                className="grid h-8 w-8 place-items-center rounded-lg bg-surface-strong text-muted hover:text-foreground"
              >
                <Plus size={15} />
              </button>
              <span className="text-xs text-muted">
                раз в неделю ({weeklyCount} из 7)
              </span>
            </div>
          )}

          {frequencyType === "CUSTOM_DAYS" && (
            <div className="mt-3 flex gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.index}
                  type="button"
                  onClick={() => toggleDay(d.index)}
                  className={`h-10 flex-1 rounded-xl border text-sm font-bold transition-all ${
                    customDays.includes(d.index)
                      ? "border-primary-strong bg-primary text-secondary"
                      : "border-border bg-surface-muted text-muted hover:border-border-strong"
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Целевое значение + единица */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              {targetLabel}
            </label>
            <input
              type="number"
              min={1}
              value={
                frequencyType === "WEEKLY" ? weeklyCount : targetValue || ""
              }
              onChange={(e) => setTargetValue(Number(e.target.value))}
              disabled={frequencyType === "WEEKLY"}
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Единица измерения
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="напр. страниц, минут, стаканов"
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {UNIT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setUnit(s)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                unit === s
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-faint hover:border-border-strong hover:text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Время напоминания + пропуски */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Время напоминания
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Пропусков в месяц
            </label>
            <input
              type="number"
              min={0}
              max={31}
              value={missesAllowed}
              onChange={(e) => setMissesAllowed(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-display text-lg font-bold text-secondary shadow-sm transition-all hover:bg-primary-strong hover:shadow-md disabled:opacity-60"
        >
          {saving ? (
            <Sparkles size={20} className="animate-spin" />
          ) : (
            <Icon name={habit ? "Save" : "Plus"} size={20} />
          )}
          {habit ? "Сохранить изменения" : "Добавить привычку"}
        </button>
      </form>
    </Modal>
  );
}