/** Marca do Viela Tech: duas paredes da viela e a cruz da saúde passando entre elas. */
export function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#0284C7" />
      <path d="M9 7v18M23 7v18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 11v10M11 16h10" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
