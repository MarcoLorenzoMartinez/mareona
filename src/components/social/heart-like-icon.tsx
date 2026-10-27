// Client: Icono SVG de corazón estilo Twitter con animación y borde rojo
"use client";

interface HeartLikeIconProps {
  readonly filled: boolean;
  readonly className?: string;
}

export function HeartLikeIcon({ filled, className = "h-4 w-4" }: HeartLikeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeWidth="1.8"
      className={`transition-transform duration-150 active:scale-125 ${
        filled
          ? "fill-[var(--primary)] stroke-[var(--primary)] text-[var(--primary)]"
          : "fill-none stroke-neutral-400 group-hover:stroke-neutral-600"
      } ${className}`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}
