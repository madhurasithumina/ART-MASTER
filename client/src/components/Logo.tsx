export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Art Master"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 46c6-12 12-22 20-30 8 8 14 18 20 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 44c4 4 9 6 14 6 6 0 10-2 14-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M45 19c6 1 9 5 7 10-1 4-4 7-9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M12 48c6 2 14 3 20 3s14-1 20-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}
