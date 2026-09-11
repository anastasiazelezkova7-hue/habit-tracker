"use client";

import { motion } from "framer-motion";

export default function ProgressBar({
  value,
  max,
  className = "",
  color,
}: {
  value: number;
  max: number;
  className?: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={`h-3 w-full overflow-hidden rounded-full bg-surface-strong ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", damping: 22, stiffness: 140 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color ?? "var(--primary)" }}
      />
    </div>
  );
}