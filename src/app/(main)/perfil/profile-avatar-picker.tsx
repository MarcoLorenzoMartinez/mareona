// Client: Selector accesible de avatares temáticos del Real Sporting
"use client";

import Image from "next/image";
import { SPORTING_AVATAR_PRESETS } from "@/lib/auth/schemas";

interface ProfileAvatarPickerProps {
  readonly selectedAvatar: string;
  readonly onSelect: (url: string) => void;
}

export function ProfileAvatarPicker({
  selectedAvatar,
  onSelect,
}: ProfileAvatarPickerProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 mb-2">
        Avatar sportinguista
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SPORTING_AVATAR_PRESETS.map((preset) => {
          const isSelected = selectedAvatar === preset.url;
          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onSelect(preset.url)}
              className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                isSelected
                  ? "border-[var(--primary)] bg-red-50/50 shadow-xs"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
              aria-pressed={isSelected}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-100 shadow-2xs">
                <Image
                  src={preset.url}
                  alt={preset.label}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "font-bold text-[var(--primary)]" : "text-neutral-700"
                }`}
              >
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
