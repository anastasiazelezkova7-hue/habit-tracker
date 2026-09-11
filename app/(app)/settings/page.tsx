"use client";

import { useEffect, useState } from "react";
import { Download, Save, UserRound, SunMoon } from "lucide-react";
import { useApp } from "@/components/app-context";
import ThemeToggle from "@/components/theme-toggle";
import Icon from "@/components/icon";
import { get } from "@/lib/client";

const USER_NAME_KEY = "jolly-lush-user-name";

export default function SettingsPage() {
  const { notify } = useApp();
  const [userName, setUserName] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(localStorage.getItem(USER_NAME_KEY) ?? "");
  }, []);

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(USER_NAME_KEY, userName.trim());
    notify("Имя сохранено", "success");
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const [habits, categories] = await Promise.all([
        get("/api/habits"),
        get("/api/categories"),
      ]);
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "jolly-lush-habits",
        version: 1,
        categories,
        habits,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jolly-lush-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify("Данные экспортированы", "success");
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-secondary">
          Настройки
        </h1>
        <p className="mt-1 text-muted">
          Персонализация и управление данными приложения
        </p>
      </div>

      {/* Тема */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-wash text-primary-stronger">
              <SunMoon size={20} />
            </span>
            <div>
              <div className="font-display text-lg font-bold text-secondary">
                Оформление
              </div>
              <div className="text-sm text-muted">
                Светлая или тёмная тема интерфейса
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Имя пользователя */}
      <form
        onSubmit={saveName}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <UserRound size={20} />
          </span>
          <div className="font-display text-lg font-bold text-secondary">
            Имя пользователя
          </div>
        </div>
        <p className="mb-3 text-sm text-muted">
          Используется в приветствии на дашборде
        </p>
        <div className="flex gap-3">
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Например: Аня"
            className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-secondary transition-colors hover:bg-primary-strong"
          >
            <Save size={17} />
            Сохранить
          </button>
        </div>
      </form>

      {/* Экспорт */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary-soft text-accent">
            <Icon name="Upload" size={20} />
          </span>
          <div>
            <div className="font-display text-lg font-bold text-secondary">
              Экспорт данных
            </div>
            <div className="text-sm text-muted">
              Скачайте все привычки, категории и отметки одним JSON-файлом
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border-strong px-5 py-3 font-bold text-muted transition-colors hover:border-primary hover:text-primary-stronger disabled:opacity-60"
        >
          <Download size={17} className={exporting ? "animate-bounce" : ""} />
          {exporting ? "Подготовка файла..." : "Экспортировать JSON"}
        </button>
      </section>

      <p className="text-xs font-semibold text-faint">
        Привычки · личный трекер в стиле Jolly Lush. Все данные хранятся локально.
      </p>
    </div>
  );
}