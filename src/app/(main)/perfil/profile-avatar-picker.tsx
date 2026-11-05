// Client: Gestión de foto de perfil con subida desde galería o cámara y fallback a iniciales rojiblancas
"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
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

    // Support instant local demo/offline preview via DataURL
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
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Seleccionar foto de perfil desde galería o cámara"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative inline-flex">
          <AuthAvatar
            src={hasCustomPhoto ? selectedAvatar : null}
            alt={displayName}
            size="lg"
            className="border-2 border-white shadow-xs"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{hasCustomPhoto ? "Cambiar foto" : "Subir foto"}</span>
          </button>

          {hasCustomPhoto && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              aria-label="Quitar foto y usar iniciales rojiblancas"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Quitar</span>
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-xs font-semibold text-[var(--primary)]">
          {uploadError}
        </p>
      )}
    </div>
  );
}
