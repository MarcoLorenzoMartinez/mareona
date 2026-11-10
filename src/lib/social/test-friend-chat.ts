import type { FriendSummary } from "./friendship-schemas";
import type { DirectConversationSummary, DirectMessage } from "./direct-messages-types";

export const TEST_FRIEND_ID = "00000000-0000-4000-a000-000000000001";
export const TEST_CONVERSATION_ID = "00000000-0000-4000-b000-000000000001";
export const TEST_FRIENDSHIP_ID = "00000000-0000-4000-c000-000000000001";

export const TEST_FRIEND_SUMMARY: FriendSummary = {
  id: TEST_FRIEND_ID,
  friendshipId: TEST_FRIENDSHIP_ID,
  username: "pelayo_gijon",
  displayName: "Pelayo Álvarez",
  avatarUrl: "/images/historical/quini-molinon.jpg",
};

export function isTestFriend(id?: string | null): boolean {
  return id === TEST_FRIEND_ID || id === "demo-user-1";
}

export function isTestConversation(id?: string | null): boolean {
  return id === TEST_CONVERSATION_ID;
}

const PELAYO_RESPONSES = [
  "¡Totalmente! En El Molinón tenemos que hacernos fuertes y salir a morder desde el primer minuto.",
  "A ver qué once saca el míster el fin de semana. Para mí Gaspar y Cote tienen que ser titulares indiscutibles.",
  "¡Eso es! Este año se nota una unión especial entre la Mareona y el equipo en la grada. ¡Puxa Sporting!",
  "Completamente de acuerdo. Si mantenemos esta intensidad en el centro del campo vamos a estar arriba.",
  "¡Puxa Sporting siempre! Da gusto poder comentar los partidos con aficionados tan rojiblancos.",
] as const;

let responseIndex = 0;

const testMessagesStore: DirectMessage[] = [
  {
    id: "00000000-0000-4000-d000-000000000001",
    conversationId: TEST_CONVERSATION_ID,
    senderId: TEST_FRIEND_ID,
    senderName: TEST_FRIEND_SUMMARY.displayName || "Pelayo Álvarez",
    senderUsername: TEST_FRIEND_SUMMARY.username,
    senderAvatar: TEST_FRIEND_SUMMARY.avatarUrl,
    body: "¡Hola! ¿Qué tal ves al Sporting para esta jornada? ¡Puxa Sporting!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isMine: false,
  },
];

export function getTestDirectMessages(): readonly DirectMessage[] {
  return [...testMessagesStore];
}

export function getTestDirectConversation(): DirectConversationSummary {
  const lastMsg = testMessagesStore[testMessagesStore.length - 1];
  return {
    id: TEST_CONVERSATION_ID,
    otherUserId: TEST_FRIEND_ID,
    otherUserName: TEST_FRIEND_SUMMARY.displayName || "Pelayo Álvarez",
    otherUserUsername: TEST_FRIEND_SUMMARY.username,
    otherUserAvatar: TEST_FRIEND_SUMMARY.avatarUrl,
    lastMessageBody: lastMsg ? lastMsg.body : null,
    lastMessageCreatedAt: lastMsg ? lastMsg.createdAt : null,
    unreadCount: 0,
  };
}

export function sendTestDirectMessage(body: string, currentUserId?: string): DirectMessage {
  const userMsgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const userMsg: DirectMessage = {
    id: userMsgId,
    conversationId: TEST_CONVERSATION_ID,
    senderId: currentUserId || "user-test",
    senderName: "Tú",
    senderUsername: "mareona",
    senderAvatar: null,
    body,
    createdAt: new Date().toISOString(),
    isMine: true,
  };

  testMessagesStore.push(userMsg);

  // Generate automated reply from Pelayo
  const replyBody = PELAYO_RESPONSES[responseIndex % PELAYO_RESPONSES.length];
  responseIndex += 1;

  const pelayoMsg: DirectMessage = {
    id: `msg-${Date.now() + 100}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId: TEST_CONVERSATION_ID,
    senderId: TEST_FRIEND_ID,
    senderName: TEST_FRIEND_SUMMARY.displayName || "Pelayo Álvarez",
    senderUsername: TEST_FRIEND_SUMMARY.username,
    senderAvatar: TEST_FRIEND_SUMMARY.avatarUrl,
    body: replyBody,
    createdAt: new Date(Date.now() + 500).toISOString(),
    isMine: false,
  };

  testMessagesStore.push(pelayoMsg);

  return userMsg;
}
