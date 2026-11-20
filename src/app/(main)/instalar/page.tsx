import type { Metadata } from "next";
import { InstallPanel } from "@/components/pwa/install-panel";
import { getDictionary } from "@/i18n";

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.layout.install.metadataTitle,
  description: dict.layout.install.metadataDescription,
};

export default function InstalarPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 py-2 md:py-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
        {dict.layout.install.title}
      </h1>
      <InstallPanel />
      <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
        {dict.layout.install.benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}
