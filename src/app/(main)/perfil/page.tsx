// Client: Página principal de perfil de aficionado sportinguista
"use client";

import { useAuth } from "@/context/auth-context";
import { ProfileGuestView } from "./profile-guest-view";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileEditForm } from "./profile-edit-form";

export default function PerfilPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6 animate-pulse" aria-busy="true">
          <div className="h-40 rounded-2xl bg-neutral-200" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 rounded-xl bg-neutral-200" />
            <div className="h-28 rounded-xl bg-neutral-200" />
            <div className="h-28 rounded-xl bg-neutral-200" />
          </div>
          <div className="h-72 rounded-2xl bg-neutral-200" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <ProfileGuestView />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <ProfileHeader />
      <ProfileStats />
      <ProfileEditForm />
    </main>
  );
}
