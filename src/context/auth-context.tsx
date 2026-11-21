// Client: Provee estado global de sesión de usuario y control del modal de acceso
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { signOut as serverSignOut } from "@/lib/auth/actions";
import { isOnboardingEligible } from "@/lib/auth/new-user";
import { useAuthSession } from "./use-auth-session";
import type { AuthContextValue, AuthProviderProps } from "./auth-types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    profile,
    isLoading,
    refreshProfile,
    setDemoSession,
    updateLocalProfile,
    clearSession,
  } = useAuthSession();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("onboarding") === "true" || params.get("email_confirmed") === "true";
  });

  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | "onboarding">(() => {
    if (typeof window === "undefined") return "signin";
    return new URLSearchParams(window.location.search).get("onboarding") === "true"
      ? "onboarding"
      : "signin";
  });

  const openAuthModal = useCallback((mode: "signin" | "signup" | "onboarding" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthModalOpen || authModalMode !== "onboarding") {
      return;
    }

    const eligible = isOnboardingEligible({
      hasUser: Boolean(user),
      userCreatedAt: user?.created_at,
      profileCreatedAt: profile?.created_at,
      profileUpdatedAt: profile?.updated_at,
    });

    if (!eligible) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("onboarding")) {
          url.searchParams.delete("onboarding");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
      queueMicrotask(() => {
        setAuthModalMode("signin");
        setIsAuthModalOpen(false);
      });
    }
  }, [isLoading, isAuthModalOpen, authModalMode, user, profile]);

  const handleSignOut = useCallback(async () => {
    clearSession();
    await serverSignOut();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        refreshProfile,
        handleSignOut,
        setDemoSession,
        updateLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
