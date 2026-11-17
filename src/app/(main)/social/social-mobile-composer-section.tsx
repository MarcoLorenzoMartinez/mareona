// Client: Botón flotante y modal de compositor para móvil en la tertulia
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MobilePostComposerFab } from "./mobile-post-composer-fab";
import { MobilePostComposerModal } from "./mobile-post-composer";
import type { SocialPost } from "@/lib/social/types";

interface SocialMobileComposerSectionProps {
  readonly onPosted: (post: SocialPost) => void;
  readonly onOpenAuth: () => void;
  readonly isAuthenticated: boolean;
}

export function SocialMobileComposerSection({
  onPosted,
  onOpenAuth,
  isAuthenticated,
}: SocialMobileComposerSectionProps) {
  const searchParams = useSearchParams();
  const isLineupParam = searchParams?.get("adjuntarOnce") === "1";
  const isMobileViewport = () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
  const [isOpen, setIsOpen] = useState(() => Boolean(isAuthenticated && isLineupParam && isMobileViewport()));
  const [prevLineupParam, setPrevLineupParam] = useState(isLineupParam);

  if (isLineupParam && !prevLineupParam) {
    setPrevLineupParam(true);
    if (isAuthenticated && isMobileViewport()) setIsOpen(true);
  } else if (!isLineupParam && prevLineupParam) {
    setPrevLineupParam(false);
  }

  useEffect(() => {
    if (isLineupParam && !isAuthenticated) {
      onOpenAuth();
    }
  }, [isLineupParam, isAuthenticated, onOpenAuth]);

  return (
    <>
      <MobilePostComposerFab
        onClick={() => {
          if (!isAuthenticated) {
            onOpenAuth();
            return;
          }
          setIsOpen(true);
        }}
      />
      <MobilePostComposerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPosted={onPosted}
      />
    </>
  );
}
