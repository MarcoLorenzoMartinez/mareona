import type { Metadata } from "next";
import { Suspense } from "react";
import { getSocialPosts } from "@/lib/social/actions";
import { SocialFeed } from "./social-feed";
import { getDictionary } from "@/i18n";

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.social.metadata.title,
  description: dict.social.metadata.description,
};

async function SocialFeedLoader() {
  const initialPosts = await getSocialPosts();
  return <SocialFeed initialPosts={initialPosts} />;
}

export default function SocialPage() {
  return (
    <div className="mx-auto w-full max-w-2xl py-4 sm:py-6">
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">{dict.common.loading}</div>}>
        <SocialFeedLoader />
      </Suspense>
    </div>
  );
}
