"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-10 w-16 items-center rounded-full border border-border bg-surface-muted transition-colors hover:border-border-strong ${className}`}
      aria-label="Переключить тему"
    >
      <span
        className={`absolute h-8 w-8 rounded-full bg-primary shadow-sm transition-all duration-300 ${
          isDark ? "left-[2px]" : "left-[28px]"
        }`}
      />
      <Moon
        size={15}
        className={`absolute left-[9px] z-10 transition-opacity ${isDark ? "opacity-100" : "opacity-40"}`}
      />
      <Sun
        size={15}
        className={`absolute right-[9px] z-10 transition-opacity ${isDark ? "opacity-40" : "opacity-100"}`}
      />
    </button>
  );
}