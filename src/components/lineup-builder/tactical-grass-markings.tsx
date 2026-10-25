/**
 * Realistic grass markings for vertical tactical football pitch with El Molinón aesthetic.
 * Muted stadium grass shades, crisp white pitch lines and watermark center badge.
 */
export function TacticalGrassMarkings() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none select-none"
      viewBox="0 0 68 105"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle grass striped gradient */}
        <linearGradient id="grass-stripes" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#256e36" />
          <stop offset="14.28%" stopColor="#256e36" />
          <stop offset="14.28%" stopColor="#216431" />
          <stop offset="28.56%" stopColor="#216431" />
          <stop offset="28.56%" stopColor="#256e36" />
          <stop offset="42.84%" stopColor="#256e36" />
          <stop offset="42.84%" stopColor="#216431" />
          <stop offset="57.12%" stopColor="#216431" />
          <stop offset="57.12%" stopColor="#256e36" />
          <stop offset="71.4%" stopColor="#256e36" />
          <stop offset="71.4%" stopColor="#216431" />
          <stop offset="85.68%" stopColor="#216431" />
          <stop offset="85.68%" stopColor="#256e36" />
          <stop offset="100%" stopColor="#256e36" />
        </linearGradient>
      </defs>

      {/* Main grass pitch background */}
      <rect width="68" height="105" fill="url(#grass-stripes)" rx="2" />

      {/* Outer pitch boundary line */}
      <rect
        x="3"
        y="3"
        width="62"
        height="99"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />

      {/* Midfield line & center circle */}
      <line
        x1="3"
        y1="52.5"
        x2="65"
        y2="52.5"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <circle
        cx="34"
        cy="52.5"
        r="9.15"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <circle cx="34" cy="52.5" r="0.6" fill="rgba(255, 255, 255, 0.85)" />

      {/* Top penalty area (attacking end) */}
      <rect
        x="13.84"
        y="3"
        width="40.32"
        height="16.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <rect
        x="24.84"
        y="3"
        width="18.32"
        height="5.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <circle cx="34" cy="14" r="0.6" fill="rgba(255, 255, 255, 0.85)" />
      <path
        d="M 26.7 19.5 A 9.15 9.15 0 0 0 41.3 19.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />

      {/* Bottom penalty area (defending end) */}
      <rect
        x="13.84"
        y="85.5"
        width="40.32"
        height="16.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <rect
        x="24.84"
        y="96.5"
        width="18.32"
        height="5.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />
      <circle cx="34" cy="91" r="0.6" fill="rgba(255, 255, 255, 0.85)" />
      <path
        d="M 26.7 85.5 A 9.15 9.15 0 0 1 41.3 85.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="0.65"
      />

      {/* Corner arcs */}
      <path d="M 5 3 A 2 2 0 0 1 3 5" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.65" />
      <path d="M 63 3 A 2 2 0 0 0 65 5" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.65" />
      <path d="M 5 102 A 2 2 0 0 0 3 100" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.65" />
      <path d="M 63 102 A 2 2 0 0 1 65 100" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.65" />
    </svg>
  );
}
