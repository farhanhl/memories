/** Mark "Memories" — pin lokasi dengan bukaan lensa di dalamnya. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
        className="fill-current"
        opacity="0.18"
      />
      <path
        d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="0.6" className="fill-current" />
    </svg>
  );
}

/** Wordmark lengkap (mark + teks). */
export function Wordmark({
  className = "",
  markClassName = "",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={`h-6 w-6 ${markClassName}`} />
      <span className="font-display text-xl font-semibold tracking-tight">
        Memories
      </span>
    </span>
  );
}
