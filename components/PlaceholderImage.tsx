// Neutral placeholder block — stands in for a real photograph until the
// client supplies images (A13 #4). Never passed off as client work: it
// carries a visible label, not a stock photo. Swap for next/image with a
// real `alt` the moment photos arrive (AGENTS.md §5 rule 9, B6.3).
export function PlaceholderImage({
  label,
  ratio = "4 / 5",
  className = "",
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder image — ${label}`}
      className={`placeholder-media relative flex items-end overflow-hidden bg-sand ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="m-3 inline-block rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-paper">
        {label}
      </span>
    </div>
  );
}
