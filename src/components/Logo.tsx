export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 4 L42 14 V34 L24 44 L6 34 V14 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M13 24a11 11 0 0 1 11-11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M17 24a7 7 0 0 1 7-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 32 L34 14"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  markClassName = "h-7 w-7",
  textClassName = "text-lg",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-display font-extrabold tracking-tight ${textClassName}`}>
        Consumo<span className="text-primary">Smart</span>
      </span>
    </span>
  );
}
