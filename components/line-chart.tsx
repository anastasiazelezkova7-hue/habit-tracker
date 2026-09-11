"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  addDays,
  eachDayBetween,
  startOfDay,
  toISODate,
} from "@/lib/dates";
import type { HabitDTO } from "@/lib/types";

const GRID = "#D5CEC5";
const FONT = "#5C7274";
const INK = "#17383C";

export default function LineChart({ habit }: { habit: HabitDTO }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const days = 60;

  const data = useMemo(() => {
    const from = addDays(today, -(days - 1));
    const logDates = new Map(
      habit.logs.filter((l) => l.isCompleted).map((l) => [l.date, l.value || 1]),
    );
    return eachDayBetween(from, today).map((d) => {
      const key = toISODate(d);
      const value = logDates.get(key) ?? 0;
      return {
        label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`,
        value,
      };
    });
  }, [habit.logs, today]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="habitArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2A9AA" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#F2A9AA" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: FONT, fontSize: 11, fontWeight: 600 }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval={8}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: FONT, fontSize: 11, fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip
          cursor={{ stroke: "#F2A9AA", strokeWidth: 2 }}
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E6E1DB",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: INK,
            boxShadow: "0 8px 24px rgba(23,56,60,.12)",
          }}
          labelStyle={{ color: FONT, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#E58586"
          strokeWidth={2.5}
          fill="url(#habitArea)"
          dot={false}
          activeDot={{ r: 5, fill: "#E58586" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}