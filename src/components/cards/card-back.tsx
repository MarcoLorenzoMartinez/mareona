import Image from "next/image";
import {
  CardScaleFrame,
  CARD_CANONICAL_WIDTH,
  CARD_CANONICAL_HEIGHT,
} from "./card-scale-frame";

interface CardBackProps {
  readonly size?: "sm" | "md" | "lg" | "fill";
  readonly isSelected?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
  readonly title?: string;
}

/**
 * Authentic black card back for unowned cards and face-down decks.
 * Displays pure black background with centered white Mareona wave logo.
 */
export function CardBack({
  size = "md",
  isSelected = false,
  onClick,
  className = "",
  title = "Cromo no desbloqueado",
}: CardBackProps) {
  return (
    <CardScaleFrame size={size} className={className}>
      <article
        onClick={onClick}
        role={onClick ? "button" : "article"}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        title={title}
        aria-label={title}
        style={{
          width: CARD_CANONICAL_WIDTH,
          height: CARD_CANONICAL_HEIGHT,
        }}
        className={`group relative flex flex-col items-center justify-center rounded-none p-2 shadow-lg transition-all duration-150 select-none bg-black border-2 border-neutral-800 ${
          isSelected
            ? "ring-4 ring-amber-400 shadow-2xl -translate-y-1.5"
            : onClick
              ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
              : "hover:shadow-xl"
        }`}
      >
        {/* Filete perimetral interior con sutil relieve heritage */}
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-none border border-neutral-800/80 bg-neutral-950 p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]">
          {/* Marco de doble línea clásico de naipe/cromo */}
          <div className="pointer-events-none absolute inset-1.5 border border-neutral-800/40" />

          {/* Logo de Mareona: La ola blanca sin fondo centrada */}
          <div className="relative flex h-24 w-24 items-center justify-center">
            <Image
              src="/images/cards/card-back-logo.png"
              alt="Mareona"
              width={128}
              height={128}
              priority={false}
              className="h-auto w-full object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.08)] pointer-events-none select-none"
            />
          </div>
        </div>
      </article>
    </CardScaleFrame>
  );
}
