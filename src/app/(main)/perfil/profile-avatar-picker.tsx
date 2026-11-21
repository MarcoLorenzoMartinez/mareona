// Client: Avatar con botón de cámara solapado y subida desde galería o cámara
"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { validateAvatarFile } from "@/lib/auth/avatar-validation";
import { compressAvatarImage } from "@/lib/auth/avatar-compression";
import { uploadAvatarImage } from "@/lib/auth/avatar-upload";
import { useAuth } from "@/context/auth-context";
import { getDictionary } from "@/i18n";

interface ProfileAvatarPickerProps {
  readonly selectedAvatar: string | null;
  readonly onSelect: (url: string | null) => void;
  readonly displayName?: string;
}

export function ProfileAvatarPicker({
  selectedAvatar,
  onSelect,
  displayName,
}: ProfileAvatarPickerProps) {
  const dict = getDictionary();
  const resolvedDisplayName = displayName ?? dict.auth.common.defaultFanName;
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setLocalPreviewUrl(null);
  };

  const activeAvatar = localPreviewUrl ?? selectedAvatar;
  const hasCustomPhoto =
    Boolean(activeAvatar) && !activeAvatar?.includes("/avatars/presets/");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    const previousAvatar = selectedAvatar;

    try {
      const optimized = await compressAvatarImage(file);
      const validation = validateAvatarFile(optimized);
      if (!validation.valid) {
        setUploadError(validation.error ?? dict.profile.avatarPicker.invalidFileFallback);
        return;
      }

      clearPreview();
      const previewUrl = URL.createObjectURL(optimized);
      previewUrlRef.current = previewUrl;
      setLocalPreviewUrl(previewUrl);

      const isDemo =
        process.env.NODE_ENV !== "production" &&
        (!user || user.id.startsWith("00000000-0000-4000-8000"));
      if (isDemo || !user) {
        onSelect(previewUrl);
        return;
      }

      const formData = new FormData();
      formData.append("file", optimized);

      const res = await uploadAvatarImage(formData);
      if (!res.success || !res.data) {
        setUploadError(res.error ?? dict.profile.avatarPicker.uploadErrorFallback);
        clearPreview();
        onSelect(previousAvatar);
        return;
      }
      clearPreview();
      onSelect(res.data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : dict.profile.avatarPicker.unexpectedError);
      clearPreview();
      onSelect(previousAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setUploadError(null);
    clearPreview();
    onSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label={dict.profile.avatarPicker.fileInputAria}
      />

      <div className="relative inline-flex">
        <AuthAvatar
          src={hasCustomPhoto ? activeAvatar : null}
          alt={resolvedDisplayName}
          size="xl"
          className="border-2 border-white shadow-xs ring-1 ring-neutral-100"
        />

        {/* Botón de cámara solapado sobre el avatar principal */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label={hasCustomPhoto ? dict.profile.avatarPicker.changePhotoAria : dict.profile.avatarPicker.uploadPhotoAria}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--primary)] text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {hasCustomPhoto && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          disabled={isUploading}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-sm"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          <span>{dict.profile.avatarPicker.removePhotoButton}</span>
        </button>
      )}

      {uploadError && (
        <p role="alert" className="text-xs font-semibold text-[var(--primary)]">
          {uploadError}
        </p>
      )}
    </div>
  );
}
