// Rótulo-mono acima de títulos — os metadados são sempre em Plex Mono/bronze.
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-bronze ${className}`}
    >
      {children}
    </div>
  );
}
