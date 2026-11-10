"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  friendRequestSchema,
  respondFriendRequestSchema,
  type FriendRequestInput,
  type RespondFriendRequestInput,
} from "./friendship-schemas";

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

/**
 * Sends a friendship request from authenticated user to addressee.
 */
export async function sendFriendRequest(
  input: FriendRequestInput
): Promise<ActionResult<{ friendshipId: string }>> {
  const parsed = friendRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión para enviar solicitudes de amistad" };
    }

    if (user.id === parsed.data.addresseeId) {
      return { success: false, error: "No puedes enviarte una solicitud a ti mismo" };
    }

    const { data: existing } = await supabase
      .from("friendships")
      .select("id, status, requester_id")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${parsed.data.addresseeId}),and(requester_id.eq.${parsed.data.addresseeId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.status === "accepted") {
        return { success: false, error: "Ya sois amigos en Mareona" };
      }
      if (existing.requester_id === user.id) {
        return { success: false, error: "Ya enviaste una solicitud pendiente" };
      }
      return { success: false, error: "Tienes una solicitud pendiente de este aficionado" };
    }

    const { data: created, error } = await supabase
      .from("friendships")
      .insert({
        requester_id: user.id,
        addressee_id: parsed.data.addresseeId,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !created) {
      return { success: false, error: error?.message ?? "Error al enviar la solicitud" };
    }

    revalidatePath("/social");
    return { success: true, data: { friendshipId: created.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error inesperado de conexión",
    };
  }
}

/**
 * Responds to an incoming friendship request.
 */
export async function respondFriendRequest(
  input: RespondFriendRequestInput
): Promise<ActionResult> {
  const parsed = respondFriendRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Acción no válida" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Debes iniciar sesión" };
    }

    if (parsed.data.action === "accept") {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", parsed.data.friendshipId)
        .eq("addressee_id", user.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", parsed.data.friendshipId)
        .eq("addressee_id", user.id);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/social");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error procesando solicitud",
    };
  }
}

/**
 * Removes an existing friendship or cancels a pending request.
 */
export async function removeFriendship(friendshipId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Debes iniciar sesión" };

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) return { success: false, error: error.message };

    revalidatePath("/social");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al eliminar amistad",
    };
  }
}
