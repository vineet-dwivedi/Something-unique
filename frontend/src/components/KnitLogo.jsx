import React from 'react';

/**
 * Knit Dev Logo — a minimal, dusky logomark.
 *
 * Three softly interlocking threads that form a woven knot,
 * drawn with warm dusty-rose, muted sage and soft amber tones.
 * Responds to the current theme via CSS custom properties.
 */
export default function KnitLogo({ size = 26, className = '' }) {
  const id = React.useId?.() ?? 'kl';

  return (
    <svg
      className={`knit-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Knit Dev logo"
    >
      <defs>
        {/* Dusky gradient — rose ➜ amber ➜ sage */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--logo-a, #c9a0a0)" />
          <stop offset="50%" stopColor="var(--logo-b, #c4ab7a)" />
          <stop offset="100%" stopColor="var(--logo-c, #8faa93)" />
        </linearGradient>

        <linearGradient id={`${id}-thread`} x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--logo-thread-a, #b08585)" />
          <stop offset="100%" stopColor="var(--logo-thread-b, #6d8e76)" />
        </linearGradient>
      </defs>

      {/* Rounded background pill */}
      <rect
        width="32"
        height="32"
        rx="8"
        fill={`url(#${id}-bg)`}
        opacity="0.14"
      />

      {/* Thread 1 — top-left ➜ bottom-right, curving */}
      <path
        d="M8 10 C12 10, 14 16, 16 16 S20 10, 24 10"
        stroke={`url(#${id}-thread)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Thread 2 — shifted down, weaving through */}
      <path
        d="M8 16 C12 16, 14 22, 16 22 S20 16, 24 16"
        stroke={`url(#${id}-thread)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Thread 3 — vertical weave accent */}
      <path
        d="M8 22 C12 22, 14 28, 16 28 S20 22, 24 22"
        stroke={`url(#${id}-thread)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />

      {/* Small knot dot — center */}
      <circle cx="16" cy="16" r="2" fill={`url(#${id}-thread)`} opacity="0.6" />
    </svg>
  );
}
