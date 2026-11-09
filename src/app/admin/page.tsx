import { redirect } from "next/navigation";

/**
 * Default admin entrypoint redirects to the content moderation queue.
 */
export default function AdminPage() {
  redirect("/admin/moderacion");
}
