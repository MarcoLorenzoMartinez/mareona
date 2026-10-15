// Markings for the unified horizontal football pitch with official FIFA proportions (105m x 68m)
export function PitchSvgMarkings() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none select-none"
      viewBox="0 0 105 68"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* 10 franjas de césped alternadas perfectamente proporcionadas */}
      <rect x="3" y="3" width="9.9" height="62" fill="#f4f7f4" />
      <rect x="12.9" y="3" width="9.9" height="62" fill="#edf3ed" />
      <rect x="22.8" y="3" width="9.9" height="62" fill="#f4f7f4" />
      <rect x="32.7" y="3" width="9.9" height="62" fill="#edf3ed" />
      <rect x="42.6" y="3" width="9.9" height="62" fill="#f4f7f4" />
      <rect x="52.5" y="3" width="9.9" height="62" fill="#edf3ed" />
      <rect x="62.4" y="3" width="9.9" height="62" fill="#f4f7f4" />
      <rect x="72.3" y="3" width="9.9" height="62" fill="#edf3ed" />
      <rect x="82.2" y="3" width="9.9" height="62" fill="#f4f7f4" />
      <rect x="92.1" y="3" width="9.9" height="62" fill="#edf3ed" />

      {/* Línea perimetral del campo (105m x 68m con margen de 3m) */}
      <rect x="3" y="3" width="99" height="62" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Línea de mediocampo y círculo central reglamentario (radio 9.15m) */}
      <line x1="52.5" y1="3" x2="52.5" y2="65" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="52.5" cy="34" r="0.6" fill="#cbd5cb" />

      {/* Portería, área grande y área chica izquierda (Equipo Local) */}
      <rect x="3" y="13.84" width="16.5" height="40.32" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <rect x="3" y="24.84" width="5.5" height="18.32" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="14" cy="34" r="0.6" fill="#cbd5cb" />
      <path d="M 19.5 26.7 A 9.15 9.15 0 0 1 19.5 41.3" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Portería, área grande y área chica derecha (Equipo Visitante) */}
      <rect x="85.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <rect x="96.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <circle cx="91" cy="34" r="0.6" fill="#cbd5cb" />
      <path d="M 85.5 26.7 A 9.15 9.15 0 0 0 85.5 41.3" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />

      {/* Córners */}
      <path d="M 5 3 A 2 2 0 0 1 3 5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 100 3 A 2 2 0 0 0 102 5" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 5 65 A 2 2 0 0 0 3 63" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
      <path d="M 100 65 A 2 2 0 0 1 102 63" fill="none" stroke="#cbd5cb" strokeWidth="0.7" />
    </svg>
  );
}
