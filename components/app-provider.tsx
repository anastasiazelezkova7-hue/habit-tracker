"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { del, get, post } from "@/lib/client";
import type { CategoryDTO, HabitDTO } from "@/lib/types";
import { AppContext, type HabitModalState } from "./app-context";
import HabitModal from "./habit-modal";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [habits, setHabits] = useState<HabitDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<HabitModalState>({ open: false, habit: null });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mounted = useRef(true);

  const notify = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3200);
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        get<HabitDTO[]>("/api/habits"),
        get<CategoryDTO[]>("/api/categories"),
      ]);
      if (!mounted.current) return;
      setHabits(h);
      setCategories(c);
    } catch (e) {
      if (mounted.current) {
        notify((e as Error).message, "error");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const toggleLog = useCallback(
    async (
      habitId: string,
      date: string,
      isCompleted = true,
      value?: number,
    ) => {
      // optimistic update
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const existing = h.logs.find((l) => l.date === date);
          const logs = existing
            ? h.logs.map((l) =>
                l.date === date ? { ...l, isCompleted, value: value ?? l.value } : l,
              )
            : [
                ...h.logs,
                {
                  id: "tmp",
                  habitId,
                  date,
                  isCompleted,
                  value: value ?? 1,
                },
              ];
          return { ...h, logs };
        }),
      );

      const log = {
        habitId,
        date,
        isCompleted,
        value: value ?? 1,
        remove: !isCompleted,
      };
      try {
        await post("/api/logs", log);
        await refresh();
      } catch (e) {
        notify((e as Error).message, "error");
        await refresh();
        throw e;
      }
    },
    [notify, refresh],
  );

  const removeLog = useCallback(
    async (habitId: string, date: string) => {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, logs: h.logs.filter((l) => l.date !== date) }
            : h,
        ),
      );
      try {
        await del("/api/logs", { habitId, date });
        await refresh();
      } catch (e) {
        notify((e as Error).message, "error");
        await refresh();
      }
    },
    [notify, refresh],
  );

  const openCreate = useCallback((habit?: HabitDTO | null) => {
    setModal({ open: true, habit: habit ?? null });
  }, []);

  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  return (
    <AppContext.Provider
      value={{
        categories,
        habits,
        loading,
        refresh,
        toggleLog,
        removeLog,
        modal,
        openCreate,
        closeModal,
        notify,
      }}
    >
      {children}
      <HabitModal
        key={`${modal.habit?.id ?? "create"}-${modal.open}`}
        open={modal.open}
        habit={modal.habit}
        onClose={closeModal}
      />
      <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
            >
              {t.type === "success" ? (
                <CheckCircle2 size={20} className="text-success" />
              ) : t.type === "error" ? (
                <XCircle size={20} className="text-error" />
              ) : (
                <Info size={20} className="text-accent" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}