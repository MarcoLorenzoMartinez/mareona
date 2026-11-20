// Client: Formulario de edición con avatar interactivo y campos de identidad
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { updateProfile } from "@/lib/auth/actions";
import { ProfileAvatarPicker } from "./profile-avatar-picker";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { getDictionary } from "@/i18n";

interface ProfileEditFormProps {
  readonly onCancel: () => void;
  readonly onSaved?: () => void;
}

export function ProfileEditForm({ onCancel, onSaved }: ProfileEditFormProps) {
  const dict = getDictionary();
  const { profile, refreshProfile, updateLocalProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    if (
      process.env.NODE_ENV !== "production" &&
      profile?.id.startsWith("00000000-0000-4000-8000")
    ) {
      updateLocalProfile({
        display_name: displayName.trim() || null,
        username: username.trim() || profile.username,
        avatar_url: selectedAvatar,
      });
      setIsSubmitting(false);
      onSaved?.();
      return;
    }

    const res = await updateProfile({
      displayName: displayName.trim() || null,
      username: username.trim() || undefined,
      avatarUrl: selectedAvatar,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setStatusMessage({
        type: "error",
        text: res.error ?? dict.profile.editForm.updateErrorFallback,
      });
      return;
    }

    await refreshProfile();
    onSaved?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-[var(--border)] bg-white px-4 py-5 sm:px-5 space-y-4"
    >
      <ProfileAvatarPicker
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
        displayName={displayName || profile?.display_name || dict.auth.common.defaultFanName}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label
            htmlFor="edit-display-name"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            {dict.profile.editForm.displayNameLabel}
          </label>
          <input
            id="edit-display-name"
            type="text"
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={dict.profile.editForm.displayNamePlaceholder}
            className="w-full min-h-[44px] rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label
            htmlFor="edit-username"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            {dict.profile.editForm.usernameLabel}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-neutral-500">
              @
            </span>
            <input
              id="edit-username"
              type="text"
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title={dict.profile.editForm.usernameTitle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={dict.profile.editForm.usernamePlaceholder}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border)] bg-white py-2 pr-3 pl-7 text-sm font-sans text-neutral-900 placeholder:text-neutral-500 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <p
          role="alert"
          className={`text-xs font-semibold ${
            statusMessage.type === "success" ? "text-green-700" : "text-[var(--primary)]"
          }`}
        >
          {statusMessage.text}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs"
        >
          {dict.profile.editForm.deleteAccountLink}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[44px] sm:min-h-9 items-center justify-center rounded-full px-4 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          >
            {dict.profile.editForm.cancelButton}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] sm:min-h-9 items-center justify-center rounded-full bg-[var(--primary)] px-4.5 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 cursor-pointer"
          >
            {isSubmitting ? dict.profile.editForm.saving : dict.profile.editForm.saveButton}
          </button>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </form>
  );
}
