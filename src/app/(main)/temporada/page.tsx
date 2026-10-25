import { redirect } from "next/navigation";

/**
 * Root route for /temporada forwards visitors directly to matches calendar (/temporada/partidos).
 */
export default function TemporadaIndexPage() {
  redirect("/temporada/partidos");
}
