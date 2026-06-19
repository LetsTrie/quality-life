import { cn } from "@/lib/utils";

/** Heart + "breath" wave, teal→blue — mirrors the mobile client's brand mark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="QLife"
    >
      <defs>
        <linearGradient id="qlifeBrand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-teal))" />
          <stop offset="100%" stopColor="hsl(var(--brand-blue))" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#qlifeBrand)" />
      <path
        d="M24 35c-1 0-9.2-5-11.6-10.4C10.6 20.4 12.6 16 16.6 16c2.6 0 4.4 1.6 5.4 3.2.6 1 1.4 1 2 0 1-1.6 2.8-3.2 5.4-3.2 4 0 6 4.4 4.2 8.6C30.2 30 25 35 24 35z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M11 25.4h5.2l2-3.4 2.8 6 2.6-8.2 2.4 5.6h6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
