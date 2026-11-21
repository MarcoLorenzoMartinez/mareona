"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Loads the authenticated user's card quantities keyed by card slug from Supabase.
 */
export async function loadUserCardsFromServer(): Promise<Record<string, number> | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_cards")
      .select("quantity, cards (slug)")
      .eq("user_id", user.id);

    if (error || !data) return null;

    const result: Record<string, number> = {};
    for (const row of data) {
      const card = row.cards as { slug?: string } | null;
      if (card?.slug && row.quantity > 0) {
        result[card.slug] = row.quantity;
      }
    }
    return result;
  } catch {
    return null;
  }
}

/**
 * Persists newly acquired card slugs into `public.user_cards` via `service_role`
 * after verifying the caller's Supabase session.
 */
export async function persistAcquiredCardsToServer(
  slugs: readonly string[]
): Promise<{ success: boolean }> {
  if (slugs.length === 0) return { success: true };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const admin = createAdminClient();
    if (!admin) return { success: false };

    const countsBySlug = new Map<string, number>();
    for (const slug of slugs) {
      if (typeof slug === "string" && /^[a-z0-9-]+$/i.test(slug)) {
        countsBySlug.set(slug, (countsBySlug.get(slug) ?? 0) + 1);
      }
    }
    if (countsBySlug.size === 0) return { success: true };

    const { data: catalogRows } = await admin
      .from("cards")
      .select("id, slug")
      .in("slug", Array.from(countsBySlug.keys()));

    const cardIdBySlug = new Map((catalogRows ?? []).map((r) => [r.slug, r.id]));
    if (cardIdBySlug.size === 0) return { success: false };

    const { data: existingRows } = await admin
      .from("user_cards")
      .select("card_id, quantity")
      .eq("user_id", user.id)
      .in("card_id", Array.from(cardIdBySlug.values()));

    const existingQtyByCardId = new Map((existingRows ?? []).map((r) => [r.card_id, r.quantity]));

    const upserts = Array.from(countsBySlug.entries())
      .map(([slug, added]) => {
        const cardId = cardIdBySlug.get(slug);
        if (!cardId) return null;
        return {
          user_id: user.id,
          card_id: cardId,
          quantity: (existingQtyByCardId.get(cardId) ?? 0) + added,
        };
      })
      .filter((x): x is { user_id: string; card_id: string; quantity: number } => x !== null);

    if (upserts.length === 0) return { success: false };

    const { error } = await admin
      .from("user_cards")
      .upsert(upserts, { onConflict: "user_id,card_id" });

    return { success: !error };
  } catch {
    return { success: false };
  }
}
