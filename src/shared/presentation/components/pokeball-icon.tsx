export function PokeballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="currentColor" strokeWidth="8" />
      <path d="M4 50a46 46 0 0 1 92 0Z" fill="#ef4444" stroke="currentColor" strokeWidth="8" />
      <circle cx="50" cy="50" r="14" fill="#fff" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}
