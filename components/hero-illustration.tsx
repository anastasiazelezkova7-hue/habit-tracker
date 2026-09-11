export default function HeroIllustration() {
  return (
    <svg
      width="460"
      height="380"
      viewBox="0 0 460 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float"
      aria-hidden="true"
    >
      {/* фоновая сфера */}
      <circle cx="230" cy="190" r="150" fill="#FBE0DF" />
      <circle cx="230" cy="190" r="122" fill="#FFF6F5" />

      {/* росток */}
      <path
        d="M230 96c2 40 6 74 18 104-20 0-38-6-50-20 8-38 22-64 32-84z"
        fill="#E58586"
      />
      <path
        d="M230 96c-2 40-6 74-18 104 20 0 38-6 50-20-8-38-22-64-32-84z"
        fill="#C75B5B"
      />
      <path
        d="M230 200c-8-22-10-44-8-66 12 2 22 8 28 18-12 12-18 28-20 48z"
        fill="#F7B7B4"
      />
      {/* стебель */}
      <path
        d="M230 200c-4 46-2 70 6 74"
        stroke="#5C8D89"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M230 200c0 40-18 56-42 58 0-20 4-42 14-60 12 4 22 4 28 2z"
        fill="#8AB17D"
      />
      <path
        d="M230 216c-6 34-24 52-48 58 2-24 10-44 24-58 10 4 18 3 24 0z"
        fill="#5C8D89"
        opacity=".7"
      />

      {/* галочки */}
      <circle cx="118" cy="118" r="30" fill="#F2A9AA" />
      <path
        d="M104 118l10 10 18-20"
        stroke="#193C40"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="350" cy="92" r="24" fill="#5C8D89" />
      <path
        d="M339 92l8 8 14-16"
        stroke="#F6F5F3"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="360" cy="266" r="20" fill="#E9C46A" />
      <path
        d="M351 266l6 7 12-13"
        stroke="#193C40"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* пламя стрика */}
      <path
        d="M92 268c0-26 14-34 22-46-2 18 12 22 12 38-18 22-34 16-34 8z"
        fill="#E58586"
      />

      {/* искры */}
      <circle cx="286" cy="120" r="6" fill="#E9C46A" />
      <circle cx="320" cy="148" r="4" fill="#F2A9AA" />
      <circle cx="150" cy="250" r="5" fill="#8AB17D" />
      <circle cx="342" cy="214" r="4" fill="#E9C46A" />
      <circle cx="110" cy="180" r="5" fill="#F7B7B4" />
    </svg>
  );
}