export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`h-8 w-8 animate-spin rounded-full border-[3px] border-outline-variant border-t-primary ${className}`}
    />
  );
}
