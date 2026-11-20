import Image from "next/image";
import {
  CardScaleFrame,
  CARD_CANONICAL_WIDTH,
  CARD_CANONICAL_HEIGHT,
} from "./card-scale-frame";
import { getDictionary } from "@/i18n";

export type CardBackTier = "standard" | "gold" | "silver";

interface CardBackProps {
  readonly size?: "sm" | "md" | "lg" | "fill";
  readonly tier?: CardBackTier;
  readonly isSelected?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
  readonly title?: string;
}

const TIER_BORDER_STYLES: Record<
  CardBackTier,
  {
    readonly outerBorder: string;
    readonly innerBorder: string;
    readonly insetBorder: string;
  }
> = {
  standard: {
    outerBorder: "border-neutral-800",
    innerBorder: "border-neutral-800/80",
    insetBorder: "border-neutral-800/40",
  },
  silver: {
    outerBorder: "border-slate-400",
    innerBorder: "border-slate-300/80",
    insetBorder: "border-slate-400/50",
  },
  gold: {
    outerBorder: "border-amber-400",
    innerBorder: "border-amber-300/80",
    insetBorder: "border-amber-400/50",
  },
};

/**
 * Authentic black card back with concentric borders for standard and special cards.
 * Preserves the pure black background and centered white wave logo, altering only
 * the concentric border frames to metallic gold or silver for special tiers.
 */
export function CardBack({
  size = "md",
  tier = "standard",
  isSelected = false,
  onClick,
  className = "",
  title,
}: CardBackProps) {
  const dict = getDictionary();
  const resolvedTitle = title ?? dict.cards.cardBackDefaultTitle;
  const borderStyles = TIER_BORDER_STYLES[tier];

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
        title={resolvedTitle}
        aria-label={resolvedTitle}
        style={{
          width: CARD_CANONICAL_WIDTH,
          height: CARD_CANONICAL_HEIGHT,
        }}
        className={`group relative flex flex-col items-center justify-center rounded-none p-2 shadow-lg transition-all duration-150 select-none bg-black border-2 ${borderStyles.outerBorder} ${
          isSelected
            ? "ring-4 ring-amber-400 shadow-2xl -translate-y-1.5"
            : onClick
              ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
              : "hover:shadow-xl"
        }`}
      >
        {/* Filete perimetral interior con sutil relieve heritage */}
        <div
          className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-none border ${borderStyles.innerBorder} bg-neutral-950 p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]`}
        >
          {/* Marco de doble línea clásico de naipe/cromo */}
          <div
            className={`pointer-events-none absolute inset-1.5 border ${borderStyles.insetBorder}`}
          />

          {/* Logo de Mareona: La ola blanca sin fondo centrada */}
          <div className="relative flex h-24 w-24 items-center justify-center">
            <Image
              src="/images/cards/card-back-logo.png"
              alt={dict.cards.cardBackLogoAlt}
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
