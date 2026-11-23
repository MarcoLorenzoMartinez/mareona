// Client: Hook managing PostComposer state, lineup attachment, poll validation, and submission
"use client";

import { useEffect, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/ui/toast";
import { useAuth } from "@/context/auth-context";
import { usePollDraft } from "@/components/social/use-poll-draft";
import {
  encodeSharedLineup,
  loadLocalSharedLineup,
  type SharedLineupData,
} from "@/lib/lineup-builder/shared-lineup-codec";
import { createSocialPost } from "@/lib/social/actions";
import { runWithNetworkTimeout } from "@/lib/pwa/network-quality";
import type { SocialPost } from "@/lib/social/types";
import { getDictionary } from "@/i18n";

export const MAX_USER_BODY_LENGTH = 500;
export const COUNTER_THRESHOLD = 380;

export function usePostComposer(
  onPosted: (post: SocialPost) => void,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  parentId?: string
) {
  const dict = getDictionary();
  const { user, profile, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const isLineupParam = !parentId && searchParams?.get("adjuntarOnce") === "1";

  const [body, setBody] = useState("");
  const [attachedLineup, setAttachedLineup] = useState<SharedLineupData | null>(() => (
    isLineupParam ? loadLocalSharedLineup() : null
  ));
  const [isExpanded, setIsExpanded] = useState(() => Boolean(parentId) || isLineupParam);
  const [prevLineupParam, setPrevLineupParam] = useState(isLineupParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poll = usePollDraft();

  if (isLineupParam && !prevLineupParam) {
    setPrevLineupParam(true);
    const draft = loadLocalSharedLineup();
    if (draft) { setAttachedLineup(draft); setIsExpanded(true); }
  } else if (!isLineupParam && prevLineupParam) {
    setPrevLineupParam(false);
  }

  const displayName = profile?.display_name || profile?.username || dict.auth.common.defaultFanName;
  const remaining = MAX_USER_BODY_LENGTH - body.length;
  const canSubmit = (body.trim().length > 0 || Boolean(attachedLineup)) && !isSubmitting;

  useEffect(() => {
    if (!isLineupParam) return;
    if (typeof window !== "undefined") window.history.replaceState({}, "", window.location.pathname);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [isLineupParam, textareaRef]);

  const handleFocus = () => {
    if (!user) { textareaRef.current?.blur(); openAuthModal("signin"); return; }
    setIsExpanded(true);
  };

  const handleToggleLineup = () => {
    if (attachedLineup) { setAttachedLineup(null); return; }
    const draft = loadLocalSharedLineup();
    if (!draft) {
      toast.info(dict.social.composer.noLineupSavedToast);
      return;
    }
    setAttachedLineup(draft);
    setIsExpanded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const validPollOptions = poll.getValidOptions();
    if (poll.isPollActive && (!validPollOptions || validPollOptions.length < 2)) {
      setError(dict.social.composer.pollMinOptionsError);
      return;
    }

    const fullBody = attachedLineup
      ? `${body.trim() ? `${body.trim()}\n\n` : ""}${encodeSharedLineup(attachedLineup)}`
      : body.trim();

    setIsSubmitting(true);
    setError(null);
    let res: Awaited<ReturnType<typeof createSocialPost>>;
    try {
      res = await runWithNetworkTimeout(
        () => createSocialPost({ body: fullBody, parentId, pollOptions: validPollOptions }),
        12_000
      );
    } catch {
      setError(dict.social.composer.publishErrorFallback);
      return;
    } finally {
      setIsSubmitting(false);
    }

    if (!res.success || !res.data) {
      setError(res.error ?? dict.social.composer.publishErrorFallback);
      return;
    }

    onPosted({
      ...res.data,
      authorName: displayName,
      authorUsername: profile?.username || "aficionado",
      authorAvatar: profile?.avatar_url || null,
    });
    setBody("");
    setAttachedLineup(null);
    poll.resetPoll();
    if (!parentId) setIsExpanded(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return {
    avatarUrl: profile?.avatar_url,
    displayName,
    body,
    setBody,
    attachedLineup,
    setAttachedLineup,
    isExpanded,
    setIsExpanded,
    isSubmitting,
    error,
    poll,
    remaining,
    canSubmit,
    handleFocus,
    handleToggleLineup,
    handleSubmit,
  };
}
