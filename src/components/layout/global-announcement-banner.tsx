import { getActiveAnnouncementPublic } from "@/lib/admin/system-actions";
import { getDictionary } from "@/i18n";

/**
 * Server component that renders a global announcement banner at the top of the app.
 * Adheres strictly to AGENTS.md: zero blue colors, pure accessible contrast, tabular numbers.
 */
export async function GlobalAnnouncementBanner() {
  const dict = getDictionary();
  const announcement = await getActiveAnnouncementPublic();

  if (!announcement || !announcement.isActive) {
    return null;
  }

  const styles = {
    info: "bg-[var(--foreground)] text-white border-b border-black/10",
    warning: "bg-amber-600 text-white border-b border-amber-700",
    alert: "bg-[var(--brand,#e2001a)] text-white border-b border-red-700",
  }[announcement.type];

  const prefix = {
    info: dict.layout.announcement.info,
    warning: dict.layout.announcement.warning,
    alert: dict.layout.announcement.alert,
  }[announcement.type];

  return (
    <aside
      role={announcement.type === "alert" ? "alert" : "status"}
      aria-live="polite"
      className={`w-full px-4 py-2 text-center text-xs sm:text-sm font-medium ${styles}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
          {prefix}
        </span>
        <span>{announcement.message}</span>
      </div>
    </aside>
  );
}
