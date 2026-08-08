import { useEffect, useState } from 'react';

/**
 * ThreadLine — Signature motion primitive for Knit Dev.
 *
 * Variants:
 * 1. "underline"      — Hero headline accent underline ("together")
 * 2. "sliding"        — Tab / layout toggle active state indicator
 * 3. "rail"           — AI build log vertical status rail
 * 4. "knot"           — Terminal connection / milestone knot mark
 * 5. "border-stitch"  — Primary CTA button loading border loop
 */
export default function ThreadLine({
  variant = 'underline',
  color = 'var(--thread-madder)',
  progress = 1,
  active = false,
  className = '',
  style = {},
  width,
  height,
  ...props
}) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  // 1. Underline beneath headline accent word
  if (variant === 'underline') {
    return (
      <svg
        className={`thread-line thread-underline ${className}`}
        viewBox="0 0 160 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M 2 8 C 35 3, 75 12, 115 6 C 135 3, 148 10, 158 7"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className={reducedMotion ? 'no-anim' : 'animate-draw-underline'}
        />
      </svg>
    );
  }

  // 2. Sliding active tab indicator
  if (variant === 'sliding') {
    return (
      <svg
        className={`thread-line thread-sliding ${className}`}
        width="100%"
        height="3"
        viewBox="0 0 100 3"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M 0 1.5 Q 50 0.5 100 1.5"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="square"
          className={reducedMotion ? 'no-anim' : 'animate-slide'}
        />
      </svg>
    );
  }

  // 3. Rail down AI build-log panel
  if (variant === 'rail') {
    return (
      <svg
        className={`thread-line thread-rail ${className}`}
        width="12"
        height="100%"
        viewBox="0 0 12 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
        aria-hidden="true"
        {...props}
      >
        <line
          x1="6"
          y1="0"
          x2="6"
          y2="100"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.25"
        />
        <line
          x1="6"
          y1="0"
          x2="6"
          y2={reducedMotion ? '100%' : `${Math.min(100, Math.max(0, progress * 100))}%`}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className={reducedMotion ? 'no-anim' : 'animate-rail'}
        />
      </svg>
    );
  }

  // 4. Terminal / Log knot indicator
  if (variant === 'knot') {
    const size = width || height || 16;
    return (
      <svg
        className={`thread-line thread-knot ${active ? 'is-tied' : 'is-open'} ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
        aria-hidden="true"
        {...props}
      >
        {active ? (
          // Tied knot path (connected / completed)
          <path
            className={reducedMotion ? 'no-anim' : 'animate-knot-tie'}
            d="M 4 12 C 7 6, 17 18, 20 12 C 17 6, 7 18, 10 12 C 12 8, 16 8, 14 12 S 10 16, 12 16"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          // Open loose thread loop (disconnected / pending)
          <path
            className="knot-open-path"
            d="M 4 14 C 8 8, 12 18, 16 10 C 18 6, 20 16, 22 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}
      </svg>
    );
  }

  // 5. Border stitch animation on primary CTA button while loading
  if (variant === 'border-stitch') {
    return (
      <svg
        className={`thread-line thread-border-stitch ${className}`}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      >
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="16 10"
          className={reducedMotion ? 'no-anim' : 'animate-stitch-loop'}
        />
      </svg>
    );
  }

  return null;
}
