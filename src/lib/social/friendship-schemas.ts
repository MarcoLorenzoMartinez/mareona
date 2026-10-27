import { z } from "zod";

export const friendRequestSchema = z.object({
  addresseeId: z.string().uuid("Identificador de aficionado no válido"),
});

export const respondFriendRequestSchema = z.object({
  friendshipId: z.string().uuid("Identificador de solicitud no válido"),
  action: z.enum(["accept", "decline"]),
});

export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;

export type FriendshipStatus = "none" | "pending_sent" | "pending_received" | "accepted";

export interface FriendSummary {
  readonly id: string;
  readonly friendshipId: string;
  readonly username: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
}

export interface UserSocialProfile {
  readonly id: string;
  readonly username: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly points: number;
  readonly createdAt: string;
  readonly friendshipStatus: FriendshipStatus;
  readonly friendshipId?: string;
}
