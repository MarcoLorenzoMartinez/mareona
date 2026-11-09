import { redirect } from "next/navigation";

/**
 * Default admin entrypoint redirects to the main dashboard (Métricas).
 */
export default function AdminPage() {
  redirect("/admin/estadisticas");
}
