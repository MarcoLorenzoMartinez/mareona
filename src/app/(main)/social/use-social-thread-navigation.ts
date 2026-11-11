// Client: Hook para gestionar la pila de navegación de hilos y teclado (Escape)
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { findPostInTree, findParentInTree } from "@/lib/social/post-tree";
import type { SocialPost } from "@/lib/social/types";

export function useSocialThreadNavigation(
  posts: readonly SocialPost[],
  initialPosts: readonly SocialPost[]
) {
  const searchParams = useSearchParams();
  const [navigationStack, setNavigationStack] = useState<readonly string[]>(() => {
    const sharedPostId = searchParams.get("post");
    return sharedPostId && findPostInTree(initialPosts, sharedPostId) ? [sharedPostId] : [];
  });

  const handlePushThread = (postId: string) => setNavigationStack((prev) => [...prev, postId]);
  const handlePopThread = () => setNavigationStack((prev) => prev.slice(0, -1));
  const removePostFromStack = (postId: string) => {
    if (navigationStack.includes(postId)) {
      setNavigationStack((prev) => prev.filter((id) => id !== postId));
    }
  };

  useEffect(() => {
    if (navigationStack.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlePopThread();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigationStack.length]);

  const activePostId = navigationStack[navigationStack.length - 1];
  const focusedPost = activePostId ? findPostInTree(posts, activePostId) : null;
  const parentPost = activePostId ? findParentInTree(posts, activePostId) : null;

  return {
    focusedPost,
    parentPost,
    handlePushThread,
    handlePopThread,
    removePostFromStack,
  };
}
