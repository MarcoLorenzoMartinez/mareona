import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/legal/constants";

export function LegalP({ children }: { readonly children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{children}</p>
  );
}

export function LegalList({ children }: { readonly children: ReactNode }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)] marker:text-[var(--border-strong)]">
      {children}
    </ul>
  );
}

export function LegalStrong({ children }: { readonly children: ReactNode }) {
  return <strong className="font-semibold text-[var(--foreground)]">{children}</strong>;
}

export function LegalMail() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="rounded-sm font-medium text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

interface LegalTableProps {
  readonly caption: string;
  readonly headers: readonly [string, string, string];
  readonly rows: readonly (readonly [string, string, string])[];
}

/**
 * Three-column reference table that collapses into labelled stacked rows on
 * narrow screens, avoiding horizontal scroll on phones.
 */
export function LegalTable({ caption, headers, rows }: LegalTableProps) {
  return (
    <table className="w-full border-y border-[var(--border)] text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only md:not-sr-only md:table-header-group">
        <tr className="border-b border-[var(--border)] text-xs text-[var(--foreground)]">
          {headers.map((header) => (
            <th key={header} scope="col" className="py-2 pr-4 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row[0]}
            className="block border-b border-[var(--border)] py-3 last:border-b-0 md:table-row md:py-0"
          >
            {row.map((cell, index) => (
              <td
                key={headers[index]}
                className={`block py-0.5 leading-relaxed text-[var(--muted-foreground)] md:table-cell md:py-3 md:pr-4 md:align-top ${
                  index === 0 ? "font-medium text-[var(--foreground)]" : ""
                }`}
              >
                <span className="text-xs font-semibold text-[var(--foreground)] md:hidden">
                  {headers[index]}:{" "}
                </span>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
