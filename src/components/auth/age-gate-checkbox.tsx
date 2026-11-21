// Client: Checkbox accesible de confirmación de edad mínima (14+ años, LOPDGDD art. 7)
"use client";

import Link from "next/link";
import { getDictionary } from "@/i18n";

interface AgeGateCheckboxProps {
  readonly id: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function AgeGateCheckbox({ id, checked, onChange }: AgeGateCheckboxProps) {
  const dict = getDictionary();
  return (
    <label htmlFor={id} className="flex min-h-[44px] items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 p-2.5 text-xs leading-relaxed text-neutral-700 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)] cursor-pointer"
      />
      <span>
        {dict.auth.ageGate.prefix}{" "}
        <Link href="/terminos" target="_blank" className="font-semibold text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]">
          {dict.auth.ageGate.termsLink}
        </Link>{" "}
        {dict.auth.ageGate.and}{" "}
        <Link href="/privacidad" target="_blank" className="font-semibold text-[var(--primary-strong)] underline underline-offset-2 hover:text-[var(--primary)]">
          {dict.auth.ageGate.privacyLink}
        </Link>
        .
      </span>
    </label>
  );
}
