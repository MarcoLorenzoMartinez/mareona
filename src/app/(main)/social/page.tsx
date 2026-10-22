import type { Metadata } from "next";
import { Suspense } from "react";
import { getSocialPosts } from "@/lib/social/actions";
import { SocialFeed } from "./social-feed";

export const metadata: Metadata = {
  title: "Tertulia Sportinguista — Mareona",
  description: "Debate, actualidad y punto de encuentro de los aficionados del Real Sporting.",
};

async function SocialFeedLoader() {
  const initialPosts = await getSocialPosts();
  return <SocialFeed initialPosts={initialPosts} />;
}

export default function SocialPage() {
  return (
    <div className="mx-auto max-w-2xl pt-2">
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-400">Cargando tertulia...</div>}>
        <SocialFeedLoader />
      </Suspense>
    </div>
  );
}
