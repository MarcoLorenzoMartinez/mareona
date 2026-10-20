import type { Metadata } from "next";
import { getSocialPosts } from "@/lib/social/actions";
import { SocialFeed } from "./social-feed";

export const metadata: Metadata = {
  title: "Tertulia Sportinguista — Mareona",
  description: "Debate, actualidad y punto de encuentro de los aficionados del Real Sporting.",
};

export default async function SocialPage() {
  const initialPosts = await getSocialPosts();

  return (
    <div className="mx-auto max-w-2xl pt-2">
      <SocialFeed initialPosts={initialPosts} />
    </div>
  );
}
