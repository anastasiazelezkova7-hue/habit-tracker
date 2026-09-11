"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2, FolderHeart } from "lucide-react";
import { useApp } from "@/components/app-context";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import ConfirmDialog from "@/components/confirm-dialog";
import EmptyState from "@/components/empty-state";
import { del, patch, post } from "@/lib/client";
import { CATEGORY_ICONS, HABIT_COLORS } from "@/lib/constants";
import type { CategoryDTO } from "@/lib/types";

export default function CategoriesPage() {
  const { categories, habits, refresh, notify } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<CategoryDTO | null>(null);

  const habitCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const h of habits) {
      m.set(h.categoryId, (m.get(h.categoryId) ?? 0) + 1);
    }
    return m;
  }, [habits]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setIcon(CATEGORY_ICONS[0]);
    setColor(HABIT_COLORS[0]);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: CategoryDTO) => {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon);
    setColor(c.color);
    setError("");
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { name: name.trim(), icon, color };
      if (editing) {
        await patch(`/api/categories/${editing.id}`, body);
        notify("Категория обновлена", "success");
      } else {
        await post("/api/categories", body);
        notify("Категория создана", "success");
      }
      await refresh();
      setModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await del(`/api/categories/${toDelete.id}`);
      notify("Категория удалена", "success");
      await refresh();
      setToDelete(null);
    } catch (e) {
      notify((e as Error).message, "error");
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-secondary">
            Категории
          </h1>
          <p className="mt-1 text-muted">
            Группируйте привычки, чтобы видеть статистику по сферам жизни
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-base font-bold text-secondary transition-colors hover:bg-primary-strong"
        >
          <Plus size={18} />
          Новая категория
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon="FolderHeart"
          title="Категорий пока нет"
          subtitle="Создайте первую категорию, чтобы группировать привычки."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-primary px-6 py-3 font-display font-bold text-secondary transition-colors hover:bg-primary-strong"
            >
              Создать категорию
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const count = habitCount.get(c.id) ?? 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: c.color + "22", color: c.color }}
                >
                  <Icon name={c.icon} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg font-bold text-secondary">
                    {c.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-faint">
                    {count} {count === 1 ? "привычка" : count >= 2 && count <= 4 ? "привычки" : "привычек"}
                    {c.isDefault && (
                      <span className="rounded-full bg-secondary-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                        по умолчанию
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-muted hover:text-muted"
                    aria-label="Редактировать"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-faint transition-colors hover:bg-primary-wash hover:text-error"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Редактировать категорию" : "Новая категория"}
        maxWidth="max-w-md"
      >
        <form onSubmit={submit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-primary-wash px-3 py-2 text-sm font-semibold text-primary-stronger">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Название
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Финансы"
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">
              Иконка
            </label>
            <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border bg-surface-muted p-2">
              {CATEGORY_ICONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIcon(n)}
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
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted">Цвет</label>
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
                    <Icon name="Check" size={16} className="text-white" strokeWidth={3.2} />
                  )}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-base font-bold text-secondary transition-colors hover:bg-primary-strong disabled:opacity-60"
          >
            <FolderHeart size={18} />
            {editing ? "Сохранить" : "Создать категорию"}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить категорию?"
        message={`Категорию «${toDelete?.name}» нельзя удалить, пока в ней есть привычки — сначала переместите их в другую категорию.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}