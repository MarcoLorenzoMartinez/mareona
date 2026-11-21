// Client: Carga perezosa de AuthModal solo cuando el usuario abre acceso o registro
"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/auth-context";

const LazyAuthModal = dynamic(
  () => import("./auth-modal").then((m) => m.AuthModal),
  { ssr: false }
);

/**
 * Defers downloading the authentication modal and avatar uploader chunks
 * until `isAuthModalOpen` actually becomes true.
 */
export function AuthModalLoader() {
  const { isAuthModalOpen } = useAuth();
  if (!isAuthModalOpen) return null;
  return <LazyAuthModal />;
}
