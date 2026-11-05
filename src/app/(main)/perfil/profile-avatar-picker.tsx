// Client: Avatar con botón de cámara solapado y subida desde galería o cámara
"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { validateAvatarFile } from "@/lib/auth/avatar-validation";
import { uploadAvatarImage } from "@/lib/auth/avatar-upload";
import { useAuth } from "@/context/auth-context";

interface ProfileAvatarPickerProps {
  readonly selectedAvatar: string | null;
  readonly onSelect: (url: string | null) => void;
  readonly displayName?: string;
}

export function ProfileAvatarPicker({
  selectedAvatar,
  onSelect,
  displayName = "Aficionado",
}: ProfileAvatarPickerProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasCustomPhoto =
    Boolean(selectedAvatar) && !selectedAvatar?.includes("/avatars/presets/");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setUploadError(validation.error ?? "Archivo no válido");
      return;
    }

    setIsUploading(true);

    const isDemo = !user || user.id.startsWith("00000000-0000-4000-8000");
    if (isDemo) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onSelect(reader.result);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAvatarImage(formData);
    setIsUploading(false);

    if (!res.success || !res.data) {
      setUploadError(res.error ?? "No se pudo subir la foto");
      return;
    }

    onSelect(res.data.url);
  };

  const handleRemovePhoto = () => {
    setUploadError(null);
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
        aria-label="Seleccionar foto de perfil desde galería o cámara"
      />

      <div className="relative inline-flex">
        <AuthAvatar
          src={hasCustomPhoto ? selectedAvatar : null}
          alt={displayName}
          size="xl"
          className="border-2 border-white shadow-xs ring-1 ring-neutral-100"
        />

        {/* Botón de cámara solapado sobre el avatar principal */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label={hasCustomPhoto ? "Cambiar foto de perfil" : "Subir foto de perfil"}
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
          <span>Quitar foto</span>
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
