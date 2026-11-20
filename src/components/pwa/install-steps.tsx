import type { ReactNode } from "react";
import type { InstallPlatform } from "@/lib/pwa/install-platform";
import { getDictionary } from "@/i18n";

function ShareIcon({ label }: { readonly label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline h-4 w-4 align-[-3px] text-[var(--primary)]"
      role="img"
      aria-label={label}
    >
      <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

/**
 * Numbered, platform-specific manual installation instructions.
 * Renders nothing for platforms with a native prompt or an installed app.
 */
export function InstallSteps({ platform }: { readonly platform: InstallPlatform }) {
  const dict = getDictionary();
  const stepsByPlatform: Partial<Record<InstallPlatform, readonly ReactNode[]>> = {
    ios: [
      <>{dict.pwa.installGuide.iosStep1Prefix} <ShareIcon label={dict.pwa.installGuide.shareAria} /> {dict.pwa.installGuide.iosStep1Suffix}</>,
      <>{dict.pwa.installGuide.iosStep2}</>,
      <>{dict.pwa.installGuide.iosStep3}</>,
    ],
    "in-app": [
      <>{dict.pwa.installGuide.inAppStep1}</>,
      <>{dict.pwa.installGuide.inAppStep2}</>,
      <>{dict.pwa.installGuide.inAppStep3}</>,
    ],
    manual: [
      <>{dict.pwa.installGuide.manualStep1}</>,
      <>{dict.pwa.installGuide.manualStep2}</>,
    ],
  };

  const steps = stepsByPlatform[platform];
  if (!steps) return null;

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3 text-sm text-[var(--foreground)]">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white tabular-nums">
            {index + 1}
          </span>
          <span className="pt-0.5 leading-snug">{step}</span>
        </li>
      ))}
    </ol>
  );
}
