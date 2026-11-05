import { MatchAttachment } from "./match-attachment";
import { PlayerAttachment } from "./player-attachment";
import { StatAttachment } from "./stat-attachment";
import type { ResolvedAttachment } from "@/lib/social/attachments/types";

/**
 * Renders the quoted Mareona data of a post. When the source is unavailable it says so
 * explicitly instead of showing placeholder data.
 */
export function PostAttachment({ attachment }: { readonly attachment: ResolvedAttachment }) {
  switch (attachment.type) {
    case "stat":
      return <StatAttachment data={attachment} />;
    case "player":
      return <PlayerAttachment data={attachment} />;
    case "match":
      return <MatchAttachment data={attachment} />;
    case "unavailable":
      return (
        <p className="mt-2 rounded-xl border border-dashed border-[var(--border)] px-3.5 py-3 text-xs text-neutral-500">
          Dato adjunto no disponible en este momento
        </p>
      );
  }
}
