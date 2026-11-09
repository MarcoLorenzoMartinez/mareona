import { getLatestAnnouncementAdmin } from "@/lib/admin/system-actions";
import { AnnouncementForm } from "./announcement-form";
import { SystemCacheTools } from "./system-cache-tools";

export const metadata = {
  title: "Comunicados | Mareona Admin",
  description: "Emisión de avisos globales y gestión de caché",
};

/**
 * Server page for announcements and system cache control.
 */
export default async function AnnouncementsAdminPage() {
  const currentAnnouncement = await getLatestAnnouncementAdmin();

  return (
    <div className="space-y-8 py-2">
      <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
        Comunicados
      </h1>

      <AnnouncementForm currentAnnouncement={currentAnnouncement} />

      <SystemCacheTools />
    </div>
  );
}
