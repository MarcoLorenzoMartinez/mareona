/** Official Google Identity Services (GIS) client library. */
export const GOOGLE_GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";

/** Pixel bounds enforced by GIS for the rendered "Sign in with Google" button. */
const GOOGLE_BUTTON_MIN_WIDTH = 200;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

export interface GoogleCredentialResponse {
  readonly credential?: string;
}

export interface GoogleIdConfiguration {
  readonly client_id: string;
  readonly callback: (response: GoogleCredentialResponse) => void;
  readonly nonce: string;
  readonly ux_mode: "popup";
}

export interface GoogleButtonConfiguration {
  readonly type: "standard";
  readonly theme: "outline";
  readonly size: "large";
  readonly text: "continue_with";
  readonly shape: "rectangular";
  readonly logo_alignment: "center";
  readonly locale: string;
  readonly width: number;
}

export interface GoogleIdentityApi {
  initialize(configuration: GoogleIdConfiguration): void;
  renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void;
}

export interface GoogleNoncePair {
  /** Sent to Supabase, which hashes it and compares it against the ID token claim. */
  readonly raw: string;
  /** Sent to Google, which embeds it verbatim as the `nonce` claim of the ID token. */
  readonly hashed: string;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates the nonce pair required by `signInWithIdToken` to defeat token replay.
 * Google and Supabase disagree on the representation (hashed vs raw), so both are returned.
 *
 * @returns A fresh cryptographically random raw nonce and its SHA-256 hex digest.
 */
export async function createGoogleNonce(): Promise<GoogleNoncePair> {
  const raw = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return { raw, hashed: toHex(new Uint8Array(digest)) };
}

/**
 * Clamps a container width to the range GIS accepts, otherwise it ignores the option.
 *
 * @param containerWidth - Measured width of the element hosting the button, in pixels.
 * @returns Integer width between 200 and 400.
 */
export function clampGoogleButtonWidth(containerWidth: number): number {
  const rounded = Math.floor(containerWidth);
  return Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.max(GOOGLE_BUTTON_MIN_WIDTH, rounded));
}

/**
 * Reads the GIS global injected by the Google script.
 *
 * @returns The API, or `null` on the server or while the script is not loaded (e.g. blocked).
 */
export function getGoogleIdentity(): GoogleIdentityApi | null {
  if (typeof window === "undefined") return null;
  const google = (window as unknown as { google?: { accounts?: { id?: GoogleIdentityApi } } })
    .google;
  return google?.accounts?.id ?? null;
}
