// Client: Provee estado global de sesión de usuario y control del modal de acceso
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { signOut as serverSignOut } from "@/lib/auth/actions";
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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

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
