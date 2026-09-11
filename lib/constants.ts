export const BRAND = {
  name: "Jolly Lush",
  appName: "Привычки",
  apricotPeach: "#FCC4C5",
  apricotPeachHover: "#F2A9AA",
  darkSlateGreen: "#193C40",
  darkSlateGreenLight: "#1A4645",
  whiteSmoke: "#F3F2F1",
  black: "#000000",
};

/** Palette used for habits & categories (harmonised with the brand). */
export const HABIT_COLORS = [
  "#5C8D89",
  "#8AB17D",
  "#E76F51",
  "#E9C46A",
  "#9B8CBF",
  "#F4A261",
  "#C75B5B",
  "#5B8B9C",
  "#B76E79",
  "#193C40",
  "#E8A1A2",
  "#7A9E9F",
];

export const ICON_OPTIONS = [
  "HeartPulse",
  "Briefcase",
  "GraduationCap",
  "Dumbbell",
  "Apple",
  "House",
  "CigaretteOff",
  "Palette",
  "Moon",
  "Flame",
  "BookOpen",
  "Coffee",
  "Bike",
  "Laptop",
  "Code",
  "Music",
  "Pencil",
  "Brush",
  "Star",
  "Lightbulb",
  "Target",
  "Trophy",
  "Leaf",
  "Pill",
  "Salad",
  "Wine",
  "Timer",
  "Watch",
  "CalendarCheck",
  "Brain",
  "Footprints",
  "Bed",
  "Shield",
  "Sparkles",
  "Rocket",
  "Heart",
  "Scale",
  "Sprout",
  "Clock",
  "Sunrise",
  "Flower",
  "Bird",
  "Wallet",
  "Gift",
  "HeartHandshake",
  "PenLine",
  "ClipboardCheck",
  "Bookmark",
  "Layers",
  "Droplets",
  "Waves",
  "Ghost",
  "Camera",
  "Plane",
  "Car",
  "Music3",
  "Palmtree",
  "Volleyball",
];

export const CATEGORY_ICONS = [
  "HeartPulse",
  "Briefcase",
  "GraduationCap",
  "Dumbbell",
  "Apple",
  "House",
  "CigaretteOff",
  "Palette",
  "Moon",
  "Flame",
  "BookOpen",
  "Coffee",
  "Bike",
  "Laptop",
  "Code",
  "Music",
  "Pencil",
  "Star",
  "Lightbulb",
  "Target",
  "Leaf",
  "Pill",
  "Salad",
  "Timer",
  "Brain",
  "Footprints",
  "Bed",
  "Shield",
  "Heart",
  "Sprout",
];

export interface FrequencyOption {
  value: "DAILY" | "WEEKLY" | "CUSTOM_DAYS";
  label: string;
  hint: string;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: "DAILY", label: "Ежедневно", hint: "Каждый день" },
  { value: "WEEKLY", label: "X раз в неделю", hint: "Гибкий график" },
  { value: "CUSTOM_DAYS", label: "По дням недели", hint: "Выберите дни" },
];

/** weekday index 0=Sunday..6=Saturday as Date.getDay() */
export const WEEKDAYS = [
  { index: 1, short: "Пн", full: "Понедельник" },
  { index: 2, short: "Вт", full: "Вторник" },
  { index: 3, short: "Ср", full: "Среда" },
  { index: 4, short: "Чт", full: "Четверг" },
  { index: 5, short: "Пт", full: "Пятница" },
  { index: 6, short: "Сб", full: "Суббота" },
  { index: 0, short: "Вс", full: "Воскресенье" },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { href: "/habits", label: "Привычки", icon: "ListChecks" },
  { href: "/calendar", label: "Календарь", icon: "CalendarDays" },
  { href: "/stats", label: "Статистика", icon: "TrendingUp" },
  { href: "/categories", label: "Категории", icon: "FolderHeart" },
  { href: "/settings", label: "Настройки", icon: "Settings" },
] as const;

export const STORAGE_KEYS = {
  userName: "jolly-lush-user-name",
} as const;

export function pluralize(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}