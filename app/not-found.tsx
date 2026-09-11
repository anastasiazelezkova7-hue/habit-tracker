import Link from "next/link";
import Logo from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-8 text-center text-foreground">
      <div className="mb-8">
        <Logo />
      </div>

      <svg
        width="260"
        height="220"
        viewBox="0 0 260 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="130" cy="110" r="92" fill="#FBE0DF" />
        <circle cx="130" cy="110" r="68" fill="#FFF6F5" />
        <path
          d="M130 60c4 30 8 52 18 72-16 0-30-4-40-14 6-28 14-46 22-58z"
          fill="#E58586"
        />
        <path
          d="M130 132c-14-4-20-20-18-24 8-6 14 2 18 8v16z"
          fill="#8AB17D"
        />
        <path
          d="M130 132c-2-16-8-26-18-32 0-10 6-18 18-22v54z"
          fill="#5C8D89"
        />
        {/* знак вопроса */}
        <circle cx="190" cy="80" r="26" fill="#E9C46A" />
        <text
          x="190"
          y="91"
          textAnchor="middle"
          fontFamily="'Baloo 2', sans-serif"
          fontWeight="800"
          fontSize="34"
          fill="#193C40"
        >
          ?
        </text>
      </svg>

      <h1 className="mt-6 font-display text-6xl font-bold text-secondary">
        404
      </h1>
      <p className="mt-3 max-w-sm text-lg text-muted">
        Ой! Эта страница забежала в забытую привычку. Похоже, её тут не было.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-primary px-8 py-3.5 font-display text-lg font-bold text-secondary shadow-md transition-transform hover:-translate-y-0.5"
      >
        На главную
      </Link>
      <p className="mt-10 text-sm font-semibold text-faint">
        © {new Date().getFullYear()} Jolly Lush · Привычки
      </p>
    </div>
  );
}