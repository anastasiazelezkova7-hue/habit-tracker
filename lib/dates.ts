export const MS_DAY = 86_400_000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Monday as first day of the week */
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  return addDays(x, -day);
}

export function endOfWeek(d: Date): Date {
  return addDays(startOfWeek(d), 6);
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function dayOfMonth(d: Date): number {
  return d.getDate();
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function eachDayBetween(a: Date, b: Date): Date[] {
  const out: Date[] = [];
  let cur = startOfDay(a);
  const end = startOfDay(b);
  let guard = 0;
  while (cur <= end && guard++ < 10_000) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

const SMONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const SDAYS = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота",
];

const SDAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function formatRuDate(d: Date): string {
  return `${d.getDate()} ${SMONTHS[d.getMonth()]}`;
}

export function formatRuFullDate(d: Date): string {
  return `${SDAYS[d.getDay()]}, ${d.getDate()} ${SMONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRuDayShort(d: Date): string {
  return SDAYS_SHORT[d.getDay()];
}

export function formatWeekdayRu(d: Date): string {
  return SDAYS[d.getDay()];
}

export function monthNameRu(m: number): string {
  return [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ][m];
}

export function monthGenitiveRu(m: number): string {
  return SMONTHS[m];
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Доброе утро";
  if (h >= 12 && h < 18) return "Добрый день";
  if (h >= 18 && h < 23) return "Добрый вечер";
  return "Доброй ночи";
}

export function weekdayFromISODate(s: string): number {
  return parseISODate(s).getDay();
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}