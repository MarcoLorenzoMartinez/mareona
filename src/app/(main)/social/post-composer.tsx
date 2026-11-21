// Client: Compositor inline colapsable con soporte para encuestas y alineaciones de Mi Once
"use client";

import { useRef } from "react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { PollCreator } from "@/components/social/poll-creator";
import { LineupAttachmentChip } from "@/components/lineup-builder/lineup-attachment-chip";
import { PostComposerControls } from "./post-composer-controls";
import {
  COUNTER_THRESHOLD,
  MAX_USER_BODY_LENGTH,
  usePostComposer,
} from "./use-post-composer";
import type { SocialPost } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

interface PostComposerProps {
  readonly onPosted: (post: SocialPost) => void;
  readonly parentId?: string;
  readonly placeholder?: string;
  readonly submitLabel?: string;
  readonly className?: string;
}

export function PostComposer({
  onPosted,
  parentId,
  placeholder,
  submitLabel,
  className = "",
}: PostComposerProps) {
  const dict = getDictionary();
  const resolvedPlaceholder = placeholder ?? dict.social.composer.defaultPlaceholder;
  const resolvedSubmitLabel = submitLabel ?? dict.social.composer.defaultSubmit;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composer = usePostComposer(onPosted, textareaRef, parentId);

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <form onSubmit={composer.handleSubmit} className={`flex gap-3 border-b border-[var(--border)] px-4 py-3 transition-colors duration-150 ${className}`}>
      <AuthAvatar src={composer.avatarUrl} alt={composer.displayName} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <label htmlFor={`composer-${parentId ?? "root"}`} className="sr-only">{resolvedPlaceholder}</label>
        <textarea
          ref={textareaRef}
          id={`composer-${parentId ?? "root"}`}
          rows={composer.isExpanded ? 3 : 1}
          value={composer.body}
          onFocus={composer.handleFocus}
          onChange={(e) => { composer.setBody(e.target.value); autoGrow(e.target); }}
          placeholder={resolvedPlaceholder}
          maxLength={MAX_USER_BODY_LENGTH}
          className="block w-full resize-none bg-transparent py-1.5 text-[15px] sm:text-base leading-snug text-neutral-900 placeholder:text-neutral-600 focus:outline-none transition-all"
        />

        {composer.attachedLineup && (
          <LineupAttachmentChip lineup={composer.attachedLineup} onRemove={() => composer.setAttachedLineup(null)} />
        )}

        {composer.poll.isPollActive && (
          <PollCreator
            options={composer.poll.pollOptions}
            onChangeOption={composer.poll.setOption}
            onAddOption={composer.poll.addOption}
            onRemoveOption={composer.poll.removeOption}
            onRemovePoll={composer.poll.resetPoll}
          />
        )}

        {composer.error && <p role="alert" className="mt-1 text-xs font-semibold text-[var(--primary)]">{composer.error}</p>}

        {composer.isExpanded && (
          <PostComposerControls
            parentId={parentId}
            isPollActive={composer.poll.isPollActive}
            hasAttachedLineup={Boolean(composer.attachedLineup)}
            onActivatePoll={composer.poll.activatePoll}
            onToggleLineup={composer.handleToggleLineup}
            onCancel={() => composer.setIsExpanded(false)}
            canCancel={!parentId && !composer.body && !composer.poll.isPollActive && !composer.attachedLineup}
            showCounter={composer.body.length >= COUNTER_THRESHOLD}
            remaining={composer.remaining}
            canSubmit={composer.canSubmit}
            isSubmitting={composer.isSubmitting}
            submitLabel={resolvedSubmitLabel}
          />
        )}
      </div>
    </form>
  );
}
