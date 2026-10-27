// Client: Barra de selector de pestaña sobria para el feed (Todos vs Amigos)
"use client";

export type SocialFeedTab = "all" | "friends";

interface FeedTabSelectorProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
}

export function FeedTabSelector({ activeTab, onTabChange }: FeedTabSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtro de la tertulia"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50/80 p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "all"}
        onClick={() => onTabChange("all")}
        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
          activeTab === "all"
            ? "bg-[var(--primary)] text-white shadow-xs font-bold"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        Todos
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "friends"}
        onClick={() => onTabChange("friends")}
        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
          activeTab === "friends"
            ? "bg-[var(--primary)] text-white shadow-xs font-bold"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        Amigos
      </button>
    </div>
  );
}
