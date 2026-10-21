import type { User } from "@supabase/supabase-js";
import { generateUsernameFromEmail } from "./schemas.ts";
import type { UserProfile } from "./actions";

/**
 * Creates a strongly typed mock User instance conforming to Supabase User type.
 */
export function createMockUser(id: string, email: string): User {
  return {
    id,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email,
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };
}

/**
 * Dedicated demo accounts for interactive testing and UI evaluation.
 * - demo-registro@mareona.com: Always tests the registration and onboarding flow.
 * - demo-login@mareona.com: Always logs into an active profile with sporting points and avatar.
 */
export const DEMO_CREDENTIALS = {
  login: {
    email: "demo-login@mareona.com",
    password: "sporting1905",
    profile: {
      id: "00000000-0000-4000-8000-000000000001",
      username: "quini_1905",
      display_name: "Pelayo Sportinguista",
      avatar_url: "/avatars/presets/quini.svg",
      points: 125,
      created_at: "2026-10-01T12:00:00Z",
      updated_at: "2026-10-01T12:00:00Z",
    } satisfies UserProfile,
  },
  register: {
    email: "demo-registro@mareona.com",
    password: "sporting1905",
    profile: {
      id: "00000000-0000-4000-8000-000000000002",
      username: "demo_registro",
      display_name: "demo_registro",
      avatar_url: "/avatars/presets/molinon.svg",
      points: 0,
      created_at: "2026-10-20T12:00:00Z",
      updated_at: "2026-10-20T12:00:00Z",
    } satisfies UserProfile,
  },
} as const;

export interface DemoAuthCheckResult {
  readonly isDemo: boolean;
  readonly error?: string;
  readonly isNewUser?: boolean;
  readonly user?: User;
  readonly profile?: UserProfile;
}

/**
 * Evaluates whether submitted credentials belong to permanent demo test accounts.
 */
export function evaluateDemoAuth(
  email: string,
  pass: string,
  tab: "signin" | "signup"
): DemoAuthCheckResult {
  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail === DEMO_CREDENTIALS.login.email) {
    if (pass !== DEMO_CREDENTIALS.login.password) {
      return { isDemo: true, error: "Contraseña incorrecta (usa: sporting1905)" };
    }
    if (tab === "signup") {
      return {
        isDemo: true,
        error: "Esta cuenta es para probar inicio de sesión. Cambia de pestaña.",
      };
    }
    return {
      isDemo: true,
      isNewUser: false,
      user: createMockUser(DEMO_CREDENTIALS.login.profile.id, cleanEmail),
      profile: DEMO_CREDENTIALS.login.profile,
    };
  }

  if (cleanEmail === DEMO_CREDENTIALS.register.email) {
    if (pass !== DEMO_CREDENTIALS.register.password) {
      return { isDemo: true, error: "Contraseña incorrecta (usa: sporting1905)" };
    }
    if (tab === "signin") {
      return {
        isDemo: true,
        error: "Esta cuenta es para probar registro. Cambia a 'Crear cuenta'.",
      };
    }
    return {
      isDemo: true,
      isNewUser: true,
      user: createMockUser(DEMO_CREDENTIALS.register.profile.id, cleanEmail),
      profile: {
        ...DEMO_CREDENTIALS.register.profile,
        username: generateUsernameFromEmail(cleanEmail),
        display_name: generateUsernameFromEmail(cleanEmail),
      },
    };
  }

  return { isDemo: false };
}
