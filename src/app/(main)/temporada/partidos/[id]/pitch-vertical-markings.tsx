/**
 * Official FIFA markings for vertical tactical football pitch (68m wide x 105m long).
 * Team defends bottom goal and attacks towards top goal.
 */
export function PitchVerticalMarkings() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none select-none"
      viewBox="0 0 68 105"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Franjas horizontales de césped alternadas */}
      <rect x="3" y="3" width="62" height="14.1" fill="#f4f7f4" />
      <rect x="3" y="17.1" width="62" height="14.1" fill="#edf3ed" />
      <rect x="3" y="31.2" width="62" height="14.1" fill="#f4f7f4" />
      <rect x="3" y="45.3" width="62" height="14.1" fill="#edf3ed" />
      <rect x="3" y="59.4" width="62" height="14.1" fill="#f4f7f4" />
      <rect x="3" y="73.5" width="62" height="14.1" fill="#edf3ed" />
      <rect x="3" y="87.6" width="62" height="14.4" fill="#f4f7f4" />

      {/* Línea perimetral reglamentaria */}
      <rect x="3" y="3" width="62" height="99" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Medio campo y círculo central (radio 9.15m) */}
      <line x1="3" y1="52.5" x2="65" y2="52.5" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="34" cy="52.5" r="0.6" fill="#cbd5cb" />

      {/* Área superior (portería rival atacada) */}
      <rect x="13.84" y="3" width="40.32" height="16.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <rect x="24.84" y="3" width="18.32" height="5.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="34" cy="14" r="0.6" fill="#cbd5cb" />
      <path d="M 26.7 19.5 A 9.15 9.15 0 0 0 41.3 19.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Área inferior (portería propia defendida) */}
      <rect x="13.84" y="85.5" width="40.32" height="16.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <rect x="24.84" y="96.5" width="18.32" height="5.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="34" cy="91" r="0.6" fill="#cbd5cb" />
      <path d="M 26.7 85.5 A 9.15 9.15 0 0 1 41.3 85.5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Córners */}
      <path d="M 5 3 A 2 2 0 0 1 3 5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 63 3 A 2 2 0 0 0 65 5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 5 102 A 2 2 0 0 0 3 100" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 63 102 A 2 2 0 0 1 65 100" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
    </svg>
  );
}
