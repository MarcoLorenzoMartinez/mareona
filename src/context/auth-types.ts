import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/auth/actions";

export interface AuthContextValue {
  readonly user: User | null;
  readonly profile: UserProfile | null;
  readonly isLoading: boolean;
  readonly isAuthModalOpen: boolean;
  readonly authModalMode: "signin" | "signup";
  readonly openAuthModal: (mode?: "signin" | "signup") => void;
  readonly closeAuthModal: () => void;
  readonly refreshProfile: () => Promise<void>;
  readonly handleSignOut: () => Promise<void>;
  readonly setDemoSession: (user: User, profile: UserProfile) => void;
  readonly updateLocalProfile: (updates: Partial<UserProfile>) => void;
}

export interface AuthProviderProps {
  readonly children: ReactNode;
}
