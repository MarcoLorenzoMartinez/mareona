import Link from "next/link";
import type { ReactNode } from "react";

interface AttachmentShellProps {
  readonly href: string;
  readonly label: string;
  readonly children: ReactNode;
}

/**
 * Clickable frame shared by every attachment card. The click is stopped from bubbling so opening
 * the attached data does not also open the post thread.
 */
export function AttachmentShell({ href, label, children }: AttachmentShellProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="mt-2 block rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 transition-colors duration-150 hover:bg-[var(--surface)] active:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      {children}
    </Link>
  );
}
