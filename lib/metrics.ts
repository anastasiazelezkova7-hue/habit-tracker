import {
  addDays,
  eachDayBetween,
  endOfWeek,
  monthKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
} from "./dates";

export type FrequencyType = "DAILY" | "WEEKLY" | "CUSTOM_DAYS";

export interface HabitLike {
  id: string;
  frequencyType: FrequencyType;
  customDays: number[] | null;
  targetValue: number;
  monthlyMissesAllowed: number;
  isArchived?: boolean;
  createdAt: Date;
}

export interface LogLike {
  date: Date;
  isCompleted: boolean;
  value: number;
}

export interface HabitLikeDTO {
  id: string;
  frequencyType: FrequencyType;
  customDays: number[] | null;
  targetValue: number;
  monthlyMissesAllowed: number;
  createdAt: string;
}

export function toHabitLike(h: HabitLikeDTO): HabitLike {
  return {
    id: h.id,
    frequencyType: h.frequencyType,
    customDays: h.customDays,
    targetValue: h.targetValue,
    monthlyMissesAllowed: h.monthlyMissesAllowed,
    createdAt: new Date(h.createdAt),
  };
}

export type CompletedSet = Set<string>;

export function completedDatesSet(logs: LogLike[]): CompletedSet {
  const s = new Set<string>();
  for (const l of logs) if (l.isCompleted) s.add(toISODate(l.date));
  return s;
}

export function logsByDate(logs: LogLike[]): Map<string, LogLike> {
  const m = new Map<string, LogLike>();
  for (const l of logs) m.set(toISODate(l.date), l);
  return m;
}

export function isScheduledDay(habit: HabitLike, day: Date): boolean {
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "CUSTOM_DAYS")
    return habit.customDays?.includes(day.getDay()) ?? false;
  return false;
}

export function countScheduledDays(
  habit: HabitLike,
  from: Date,
  to: Date,
): number {
  let n = 0;
  let cur = startOfDay(from);
  const end = startOfDay(to);
  let guard = 0;
  while (cur <= end && guard++ < 4000) {
    if (isScheduledDay(habit, cur)) n++;
    cur = addDays(cur, 1);
  }
  return n;
}

/** Completions inside the ISO week (Mon-Sun) containing `day`. */
export function weeklyCompletions(
  habit: HabitLike,
  completed: CompletedSet,
  day: Date,
): number {
  const start = startOfWeek(day);
  const end = endOfWeek(day);
  let n = 0;
  let cur = start;
  let guard = 0;
  while (cur <= end && guard++ < 10) {
    if (completed.has(toISODate(cur))) n++;
    cur = addDays(cur, 1);
  }
  return n;
}

export function weekQuotaMet(
  habit: HabitLike,
  completed: CompletedSet,
  day: Date,
): boolean {
  if (habit.frequencyType !== "WEEKLY") return false;
  return weeklyCompletions(habit, completed, day) >= habit.targetValue;
}

export function currentStreakDays(
  habit: HabitLike,
  completed: CompletedSet,
  today: Date,
): number {
  let cursor = startOfDay(today);
  if (!completed.has(toISODate(cursor))) cursor = addDays(cursor, -1);

  let streak = 0;
  let pool = habit.monthlyMissesAllowed;
  let lastMonth: string | null = null;
  const created = startOfDay(habit.createdAt);
  let guard = 0;

  while (guard++ < 3660) {
    if (cursor < created) break;
    const mk = monthKey(cursor);
    if (mk !== lastMonth) {
      pool = habit.monthlyMissesAllowed;
      lastMonth = mk;
    }
    const done = completed.has(toISODate(cursor));
    if (done) {
      streak++;
    } else {
      if (
        habit.frequencyType === "DAILY" ||
        habit.frequencyType === "CUSTOM_DAYS"
      ) {
        if (isScheduledDay(habit, cursor)) {
          if (pool > 0) {
            pool--;
            streak++;
          } else return streak;
        }
      } else if (habit.frequencyType === "WEEKLY") {
        if (weekQuotaMet(habit, completed, cursor)) streak++;
        else if (pool > 0) {
          pool--;
          streak++;
        } else return streak;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreakDays(
  habit: HabitLike,
  completed: CompletedSet,
  today: Date,
): number {
  let best = 0;
  let cur = 0;
  let pool = habit.monthlyMissesAllowed;
  let lastMonth: string | null = null;

  const days = eachDayBetween(habit.createdAt, today);
  for (const day of days) {
    const mk = monthKey(day);
    if (mk !== lastMonth) {
      pool = habit.monthlyMissesAllowed;
      lastMonth = mk;
    }
    const done = completed.has(toISODate(day));
    if (done) {
      cur++;
    } else {
      let keepAlive = false;
      if (
        habit.frequencyType === "DAILY" ||
        habit.frequencyType === "CUSTOM_DAYS"
      ) {
        if (isScheduledDay(habit, day)) {
          if (pool > 0) {
            pool--;
            keepAlive = true;
          }
        }
      } else if (habit.frequencyType === "WEEKLY") {
        if (weekQuotaMet(habit, completed, day)) keepAlive = true;
        else if (pool > 0) {
          pool--;
          keepAlive = true;
        }
      }
      if (keepAlive) cur++;
      else cur = 0;
    }
    if (cur > best) best = cur;
  }
  return best;
}

export function missesThisMonth(
  habit: HabitLike,
  completed: CompletedSet,
  today: Date,
): number {
  if (habit.frequencyType === "WEEKLY") return 0;
  let misses = 0;
  const from = startOfMonth(today);
  let cur = from;
  let guard = 0;
  while (cur <= today && guard++ < 31) {
    if (
      isScheduledDay(habit, cur) &&
      !completed.has(toISODate(cur))
    ) {
      misses++;
    }
    cur = addDays(cur, 1);
  }
  return misses;
}

export function remainingMisses(
  habit: HabitLike,
  completed: CompletedSet,
  today: Date,
): number {
  const used = missesThisMonth(habit, completed, today);
  return Math.max(0, habit.monthlyMissesAllowed - used);
}

/** Completion % over a trailing window (7/15/30 days). 0..1 */
export function completionRate(
  habit: HabitLike,
  completed: CompletedSet,
  today: Date,
  windowDays: number,
): number {
  const from = addDays(today, -(windowDays - 1));
  if (habit.frequencyType === "WEEKLY") {
    const expected = (habit.targetValue * windowDays) / 7;
    let done = 0;
    let cur = from;
    let guard = 0;
    while (cur <= today && guard++ < windowDays + 1) {
      if (completed.has(toISODate(cur))) done++;
      cur = addDays(cur, 1);
    }
    return Math.min(1, expected === 0 ? 0 : done / expected);
  }
  const expected = countScheduledDays(habit, from, today);
  let done = 0;
  let cur = from;
  let guard = 0;
  while (cur <= today && guard++ < windowDays + 1) {
    if (isScheduledDay(habit, cur) && completed.has(toISODate(cur))) done++;
    cur = addDays(cur, 1);
  }
  return expected === 0 ? 0 : done / expected;
}

export interface DayStats {
  date: string;
  total: number;
  done: number;
  percent: number;
}

export const HEATMAP_COLORS = [
  "#EFE8E0",
  "#FCD5D2",
  "#F7A6A1",
  "#E87D72",
  "#C75B5B",
  "#8E4A43",
];

export function heatmapColor(percent: number): string {
  if (percent <= 0) return HEATMAP_COLORS[0];
  const steps = HEATMAP_COLORS.length - 1;
  const idx = Math.max(0, Math.min(steps - 1, Math.ceil(percent * steps) - 1));
  return HEATMAP_COLORS[idx];
}

export interface Motivation {
  text: string;
  emoji: string;
  tone: "good" | "bad" | "neutral";
}

export function buildMotivation(
  todayDone: number,
  todayTotal: number,
  yesterdayDone: number,
  yesterdayTotal: number,
): Motivation {
  if (todayTotal === 0)
    return {
      text: "Привычек на сегодня нет. Добавьте первую!",
      emoji: "🌱",
      tone: "neutral",
    };

  if (todayDone === 0) {
    if (yesterdayDone > 0)
      return {
        text: "Ты пропустил сегодня, ай-ай-ай. Максимум сегодня!",
        emoji: "🙈",
        tone: "bad",
      };
    return {
      text: "Каждая привычка начинается с одного маленького шага.",
      emoji: "🌱",
      tone: "neutral",
    };
  }

  if (todayDone > yesterdayDone)
    return {
      text: `Отлично! Сегодня ${todayDone}/${todayTotal}, вчера было ${yesterdayDone}/${yesterdayTotal} — прогресс налицо!`,
      emoji: "🔥",
      tone: "good",
    };

  if (todayDone === yesterdayDone)
    return {
      text: `Ровный темп: ${todayDone}/${todayTotal} сегодня и ${yesterdayDone}/${yesterdayTotal} вчера. Так держать!`,
      emoji: "💪",
      tone: "good",
    };

  return {
    text: `Сегодня ${todayDone}/${todayTotal}, вчера было ${yesterdayDone}/${yesterdayTotal} — подтянись!`,
    emoji: "🚀",
    tone: "neutral",
  };
}