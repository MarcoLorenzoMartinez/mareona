import { redirect } from "next/navigation";

/**
 * Root route redirects visitors to the primary vertical section (/temporada).
 */
export default function HomePage() {
  redirect("/temporada");
}
