import { getLatestAnnouncementAdmin } from "@/lib/admin/system-actions";
import { AnnouncementForm } from "./announcement-form";
import { SystemCacheTools } from "./system-cache-tools";

export const metadata = {
  title: "Avisos y Sistema | Mareona Admin",
  description: "Emisión de comunicados globales y gestión operativa de caché en Mareona",
};

/**
 * Server page for announcements, maintenance mode, and system cache control.
 */
export default async function AnnouncementsAdminPage() {
  const currentAnnouncement = await getLatestAnnouncementAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Avisos del Sistema y Operaciones
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Control de mensajes prioritarios para toda la afición y purga manual de datos deportivos.
        </p>
      </div>

      <AnnouncementForm currentAnnouncement={currentAnnouncement} />

      <SystemCacheTools />
    </div>
  );
}
