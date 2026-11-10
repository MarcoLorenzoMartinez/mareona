// Client: Pestañas del feed en píldora (Todos, Amigos, Mensajes) con navegación accesible
"use client";

export type SocialFeedTab = "all" | "friends" | "messages";

interface FeedTabSelectorProps {
  readonly activeTab: SocialFeedTab;
  readonly onTabChange: (tab: SocialFeedTab) => void;
  readonly unreadDMsCount?: number;
}

const TABS: readonly { readonly id: SocialFeedTab; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "friends", label: "Amigos" },
  { id: "messages", label: "Mensajes" },
];

export function FeedTabSelector({
  activeTab,
  onTabChange,
  unreadDMsCount = 0,
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
      aria-label="Filtro de la tertulia y mensajes"
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === "messages" && unreadDMsCount > 0;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`relative min-h-9 rounded-full px-3.5 sm:px-4 text-xs sm:text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              isActive
                ? "bg-[var(--primary)] font-bold text-white shadow-2xs"
                : "font-semibold text-neutral-700 hover:bg-[var(--surface)]"
            }`}
          >
            <span>{tab.label}</span>
            {showBadge && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold tabular-nums text-[var(--primary)]">
                {unreadDMsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
