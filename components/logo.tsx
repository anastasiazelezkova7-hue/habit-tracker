import Link from "next/link";
import Icon from "./icon";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      aria-label="Привычки — на главную"
    >
      <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-strong shadow-sm transition-transform group-hover:scale-105">
        <Icon name="Sprout" size={24} className="text-secondary" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`font-display text-2xl font-bold ${
            dark ? "text-background" : "text-secondary"
          }`}
        >
          Привычки
        </span>
        <span
          className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${
            dark ? "text-primary-stronger" : "text-primary-stronger"
          }`}
        >
          jolly lush
        </span>
      </span>
    </Link>
  );
}