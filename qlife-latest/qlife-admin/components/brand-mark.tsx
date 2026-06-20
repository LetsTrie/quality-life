"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * QLife brand mark — mirrors the mobile launcher icon: a gradient tile holding a
 * white heart with a teal "breath" wave. The self-contained tile keeps it legible
 * on any surface (the gradient login hero, white cards, the sidebar alike).
 */
export function BrandMark({ className }: { className?: string }) {
  // Unique per instance: the mark renders in several places at once. A shared
  // gradient id collides, and if the first match sits inside a `display:none`
  // container its paint server never resolves — leaving an unfilled tile. useId
  // keeps each gradient isolated.
  const gradientId = `qlifeBrand-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="QLife"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--brand-teal))" />
          <stop offset="100%" stopColor="hsl(var(--brand-blue))" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <path
        d="M32 55C16 42 10 31 10 22.5 10 15.5 15.4 10 22 10c4.4 0 8.2 2.4 10 6 1.8-3.6 5.6-6 10-6 6.6 0 12 5.5 12 12.5C54 31 48 42 32 55Z"
        fill="#fff"
      />
      <path
        d="M14 32 C18 26 24 26 28 31 C32 36 38 36 42 30 C45 26.5 49 27 51 29.5"
        fill="none"
        stroke="#2A8C7D"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
