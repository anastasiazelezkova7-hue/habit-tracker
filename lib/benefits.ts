export interface BenefitResult {
  emoji: string;
  text: string;
}

export interface BenefitRule {
  key: string;
  match: (unit: string) => boolean;
  format: (value: number) => BenefitResult;
}

const pluralRu = (n: number, one: string, few: string, many: string) => {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};

export const BENEFIT_RULES: BenefitRule[] = [
  {
    key: "pages",
    match: (u) => /страниц|страниц|стр\.|стрaницы/i.test(u),
    format: (value) =>
      value >= 160
        ? {
            emoji: "📚",
            text: `${value} ${pluralRu(value, "страница", "страницы", "страниц")} ≈ ${(value / 160).toFixed(1).replace(".0", "")} ${pluralRu(Math.round(value / 160), "книга", "книги", "книг")}!`,
          }
        : {
            emoji: "📖",
            text: `${value} ${pluralRu(value, "страница", "страницы", "страниц")} — неплохой задел до целой книги!`,
          },
  },
  {
    key: "minutesSaved",
    match: (u) => /минут|мин\.?|минуты/i.test(u),
    format: (value) => {
      const hours = value / 60;
      return {
        emoji: "⏳",
        text:
          hours >= 1
            ? `${value} ${pluralRu(value, "минута", "минуты", "минут")} ≈ ${hours.toFixed(1).replace(".0", "")} ${pluralRu(Math.round(hours), "час", "часа", "часов")} ${value >= 120 ? "жизни возвращено" : "сэкономлено"}!`
            : `${value} ${pluralRu(value, "минута", "минуты", "минут")} сэкономлено!`,
      };
    },
  },
  {
    key: "steps",
    match: (u) => /шаг/i.test(u),
    format: (value) => {
      const km = value / 1400;
      return {
        emoji: "👟",
        text: `${value.toLocaleString("ru-RU")} ${pluralRu(value, "шаг", "шага", "шагов")} ≈ ${km.toFixed(1).replace(".0", "")} км!`,
      };
    },
  },
  {
    key: "km",
    match: (u) => /км|километр/i.test(u),
    format: (value) => {
      const stations = value / 2;
      return {
        emoji: "🏃",
        text:
          value >= 2
            ? `${value} ${pluralRu(value, "км", "км", "км")} ≈ ${stations.toFixed(0)} ${pluralRu(Math.round(stations), "станция", "станции", "станций")} метро. Мощно!`
            : `${value} км — каждая дистанция начинается с малого!`,
      };
    },
  },
  {
    key: "water",
    match: (u) => /стакан|вод|литр|мл|мг/i.test(u),
    format: (value) => {
      const ml = value <= 10 ? value * 200 : value;
      return {
        emoji: "💧",
        text: `${value} ${pluralRu(value, "стакан", "стакана", "стаканов")} воды ≈ ${ml.toLocaleString("ru-RU")} мл — отличная гидратация!`,
      };
    },
  },
  {
    key: "hours",
    match: (u) => /час/i.test(u),
    format: (value) =>
      value >= 24
        ? {
            emoji: "⏰",
            text: `${value} ${pluralRu(value, "час", "часа", "часов")} ≈ ${(value / 24).toFixed(1).replace(".0", "")} ${pluralRu(Math.round(value / 24), "день", "дня", "дней")} жизни!`,
          }
        : { emoji: "⏰", text: `${value} часов продуктивности!` },
  },
  {
    key: "money",
    match: (u) => /рубл|₽|руб|денег|ден/i.test(u),
    format: (value) => ({
      emoji: "💰",
      text: `${value.toLocaleString("ru-RU")} ₽ — инвестиция в себя!`,
    }),
  },
];

export function getBenefit(unit: string, value: number): BenefitResult | null {
  const u = unit.trim();
  if (!u || value <= 0) return null;
  const rule = BENEFIT_RULES.find((r) => r.match(u));
  if (!rule) {
    if (value >= 10)
      return { emoji: "✨", text: `${value} ${u} — внушительный результат!` };
    return null;
  }
  return rule.format(value);
}