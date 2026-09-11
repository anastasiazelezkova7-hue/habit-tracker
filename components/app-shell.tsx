"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import Icon from "./icon";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { useApp } from "./app-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openCreate } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="flex w-[264px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="px-6 pb-5 pt-7">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-bold transition-colors ${
                  active
                    ? "bg-secondary text-background"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} size={20} strokeWidth={2.1} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 px-4 pb-6 pt-4">
          <button
            type="button"
            onClick={() => openCreate()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-base font-bold text-secondary shadow-sm transition-all hover:bg-primary-strong hover:shadow-md"
          >
            <Plus size={20} strokeWidth={2.4} />
            Добавить привычку
          </button>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
            <span className="text-sm font-bold text-muted">Тема</span>
            <ThemeToggle />
          </div>
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-faint">
            Jolly Lush · привычки
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-8 py-8 pb-16">{children}</div>
      </main>
    </div>
  );
}