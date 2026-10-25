// Client: Avatar de futbolista con gestión de error de carga y fallback al busto genérico oficial
"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayerAvatarFallback } from "@/components/media/player-avatar-fallback";

interface SafePlayerAvatarProps {
  readonly photoUrl: string | null | undefined;
  readonly displayName?: string;
  readonly sizes: string;
  readonly isToken?: boolean;
}

export function SafePlayerAvatar({
  photoUrl,
  sizes,
  isToken = false,
}: SafePlayerAvatarProps) {
  const [hasError, setHasError] = useState(false);

  if (photoUrl && !hasError) {
    return (
      <div className="relative h-full w-full bg-[#f3f4f3]">
        <Image
          src={photoUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-top"
          onError={() => setHasError(true)}
          unoptimized
        />
      </div>
    );
  }

  // Fallback con la silueta / busto atlético genérico
  return (
    <PlayerAvatarFallback
      teamColor={isToken ? "#ffffff" : "#a3a3a3"}
      className="h-full w-full"
    />
  );
}
