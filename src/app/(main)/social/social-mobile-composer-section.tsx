// Client: Botón flotante y modal de compositor para móvil en la tertulia
"use client";

import { useState } from "react";
import { MobilePostComposerFab, MobilePostComposerModal } from "./mobile-post-composer";
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
  const [isOpen, setIsOpen] = useState(false);

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
