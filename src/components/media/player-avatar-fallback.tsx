// Player silhouette avatar fallback using subtle team-colored transparency
interface PlayerAvatarFallbackProps {
  readonly teamColor: string;
  readonly className?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return `rgba(160, 160, 160, ${alpha})`;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function PlayerAvatarFallback({
  teamColor,
  className = "h-full w-full",
}: PlayerAvatarFallbackProps) {
  const bgTint = hexToRgba(teamColor, 0.12);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden select-none ${className}`}
      style={{ backgroundColor: bgTint }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        style={{ color: teamColor, opacity: 0.55 }}
      >
        {/* Cabeza atlética proporcionada y equilibrada */}
        <circle cx="32" cy="23" r="13" fill="currentColor" />
        {/* Hombros y torso cercanos a la cabeza que descienden hasta la base del círculo */}
        <path
          d="M12 64 C12 47 20 40 32 40 C44 40 52 47 52 64 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
