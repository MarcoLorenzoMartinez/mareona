import type { Database } from "@/types/database.types";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}
