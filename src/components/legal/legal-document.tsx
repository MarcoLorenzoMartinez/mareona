import type { ReactNode } from "react";
import { LEGAL_UPDATED_ISO } from "@/lib/legal/constants";

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly content: ReactNode;
}

interface LegalDocumentProps {
  readonly title: string;
  readonly sections: readonly LegalSection[];
}

const updatedLabel = new Date(LEGAL_UPDATED_ISO).toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  // Date-only ISO strings parse as UTC; formatting in UTC avoids an off-by-one day.
  timeZone: "UTC",
});

const LINK_FOCUS =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2";

/**
 * Shared layout for the legal pages: title, update date, sticky index on
 * desktop and numbered sections with a readable line length.
 */
export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-5xl py-2 md:py-4">
      <header className="border-b border-[var(--border)] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Última actualización: <time dateTime={LEGAL_UPDATED_ISO}>{updatedLabel}</time>
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label={`Índice de ${title}`} className="hidden lg:block">
          <ol className="sticky top-24 space-y-0.5 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`flex min-h-9 items-center gap-2 text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--primary)] ${LINK_FOCUS}`}
                >
                  <span className="w-4 tabular-nums">{index + 1}.</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-2xl space-y-9">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-24 space-y-3"
            >
              <h2
                id={`${section.id}-title`}
                className="text-lg font-bold tracking-tight text-[var(--foreground)]"
              >
                <span className="tabular-nums">{index + 1}.</span> {section.title}
              </h2>
              {section.content}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
