import Icon from "./icon";
import { pluralize } from "@/lib/constants";

export default function StreakBadge({
  streak,
  size = "md",
  best = false,
}: {
  streak: number;
  size?: "sm" | "md" | "lg";
  best?: boolean;
}) {
  const dims =
    size === "lg" ? "text-5xl" : size === "md" ? "text-3xl" : "text-xl";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid place-items-center rounded-full ${
          size === "lg" ? "h-14 w-14" : "h-9 w-9"
        } ${best ? "bg-warning/20 text-warning" : "bg-primary-soft text-primary-stronger"}`}
        title={best ? "Лучший стрик" : "Текущий стрик"}
      >
        <Icon name={best ? "Trophy" : "Flame"} size={size === "lg" ? 28 : 20} />
      </span>
      <div>
        <div className={`font-display font-bold leading-none ${dims}`}>
          {streak}
        </div>
        <div className="mt-1 text-xs font-bold text-faint">
          {pluralize(streak, "день", "дня", "дней")} {best ? "максимум" : "подряд"}
        </div>
      </div>
    </div>
  );
}