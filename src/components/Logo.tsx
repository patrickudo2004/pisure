export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="var(--accent)" />
        {/* rising sun over the horizon */}
        <circle cx="16" cy="15" r="6.5" fill="var(--accent-foreground)" />
        <rect x="5" y="20" width="22" height="2.5" rx="1.25" fill="var(--accent-foreground)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        Pisure
      </span>
    </span>
  );
}
