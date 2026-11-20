// Client: Hook para sincronización de sesión Supabase y persistencia demo en localStorage
"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/auth/actions";
import {
  getStoredDemoSession,
  saveDemoSession,
  clearStoredDemoSession,
  updateStoredDemoProfile,
} from "@/lib/auth/demo-session-storage";

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) setProfile(data);
    } catch {
      // Offline fallback
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        clearStoredDemoSession();
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      } else if (user?.id) {
        await fetchProfile(user.id);
      }
    } catch {
      if (user?.id) {
        await fetchProfile(user.id);
      }
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function syncSession(sessionUser: User | null) {
      if (!mounted) return;
      if (sessionUser) {
        clearStoredDemoSession();
        setUser(sessionUser);
        await fetchProfile(sessionUser.id);
      } else {
        const stored =
          process.env.NODE_ENV !== "production" ? getStoredDemoSession() : null;
        if (stored) {
          setUser(stored.user);
          setProfile(stored.profile);
        } else {
          if (process.env.NODE_ENV === "production") clearStoredDemoSession();
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    }

    async function initSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await syncSession(session?.user ?? null);
      } catch {
        const stored =
          process.env.NODE_ENV !== "production" ? getStoredDemoSession() : null;
        if (stored && mounted) {
          setUser(stored.user);
          setProfile(stored.profile);
        }
        if (mounted) setIsLoading(false);
      }
    }

    void initSession();

    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT") {
          clearStoredDemoSession();
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }
        await syncSession(session?.user ?? null);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, [fetchProfile]);

  const setDemoSession = useCallback((demoUser: User, demoProfile: UserProfile) => {
    if (process.env.NODE_ENV === "production") return;
    saveDemoSession(demoUser, demoProfile);
    setUser(demoUser);
    setProfile(demoProfile);
    setIsLoading(false);
  }, []);

  const updateLocalProfile = useCallback((updates: Partial<UserProfile>) => {
    updateStoredDemoProfile(updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const clearSession = useCallback(() => {
    clearStoredDemoSession();
    setUser(null);
    setProfile(null);
  }, []);

  return {
    user,
    profile,
    isLoading,
    refreshProfile,
    setDemoSession,
    updateLocalProfile,
    clearSession,
  };
}
