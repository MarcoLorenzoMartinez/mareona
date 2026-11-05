// Client: Pestañas del feed en píldora (Todos vs Amigos) con navegación por flechas
"use client";

export type SocialFeedTab = "all" | "friends";

interface FeedTabSelectorProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
}

const TABS: readonly { readonly id: SocialFeedTab; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "friends", label: "Amigos" },
];

export function FeedTabSelector({ activeTab, onTabChange }: FeedTabSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    onTabChange(activeTab === "all" ? "friends" : "all");
  };

  return (
    <div
      role="tablist"
      aria-label="Filtro de la tertulia"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`min-h-9 rounded-full px-4 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              isActive
                ? "bg-[var(--primary)] font-bold text-white"
                : "font-semibold text-neutral-700 hover:bg-[var(--surface)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
