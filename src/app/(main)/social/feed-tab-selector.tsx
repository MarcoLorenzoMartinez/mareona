// Client: Pestañas del feed en píldora (Todos, Amigos) con navegación accesible
"use client";

export type SocialFeedTab = "all" | "friends" | "messages";

interface FeedTabSelectorProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
}

const TABS: readonly { readonly id: "all" | "friends"; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "friends", label: "Amigos" },
];

export function FeedTabSelector({
  activeTab,
  onTabChange,
}: FeedTabSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
    const nextIndex =
      e.key === "ArrowRight"
        ? (currentIndex + 1) % TABS.length
        : (currentIndex - 1 + TABS.length) % TABS.length;
    onTabChange(TABS[nextIndex]!.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Filtro de publicaciones de la tertulia"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
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
            className={`min-h-[34px] rounded-full px-3.5 sm:px-4 text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer ${
              isActive
                ? "bg-[var(--primary)] font-bold text-white shadow-2xs"
                : "font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
