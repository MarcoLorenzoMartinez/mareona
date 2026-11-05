import type { Metadata } from "next";
import { Suspense } from "react";
import { getSocialPosts } from "@/lib/social/actions";
import { SocialFeed } from "./social-feed";

export const metadata: Metadata = {
  title: "Social",
  description: "Debate, actualidad y punto de encuentro de los aficionados del Real Sporting.",
};

async function SocialFeedLoader() {
  const initialPosts = await getSocialPosts();
  return <SocialFeed initialPosts={initialPosts} />;
}

export default function SocialPage() {
  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-6">
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Cargando…</div>}>
        <SocialFeedLoader />
      </Suspense>
    </div>
  );
}
