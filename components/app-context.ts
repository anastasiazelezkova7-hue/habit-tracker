"use client";

import { createContext, useContext } from "react";
import type { CategoryDTO, HabitDTO } from "@/lib/types";

export interface HabitModalState {
  open: boolean;
  habit: HabitDTO | null;
}

export interface AppContextValue {
  categories: CategoryDTO[];
  habits: HabitDTO[];
  loading: boolean;
  refresh: () => Promise<void>;
  toggleLog: (
    habitId: string,
    date: string,
    isCompleted?: boolean,
    value?: number,
  ) => Promise<void>;
  removeLog: (habitId: string, date: string) => Promise<void>;
  modal: HabitModalState;
  openCreate: (habit?: HabitDTO | null) => void;
  closeModal: () => void;
  notify: (message: string, type?: "success" | "error" | "info") => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}