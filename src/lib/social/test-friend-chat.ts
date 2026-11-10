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

interface TestChatRecord {
  readonly id: string;
  readonly otherUserId: string;
  readonly otherUserName: string;
  readonly otherUserUsername: string;
  readonly otherUserAvatar: string | null;
  unreadCount: number;
  readonly messages: DirectMessage[];
}

const createMsg = (
  id: string,
  convId: string,
  senderId: string,
  senderName: string,
  senderUsername: string,
  body: string,
  minutesAgo: number,
  isMine = false,
  senderAvatar: string | null = null
): DirectMessage => ({
  id,
  conversationId: convId,
  senderId,
  senderName,
  senderUsername,
  senderAvatar,
  body,
  createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
  isMine,
});

const testChats: TestChatRecord[] = [
  {
    id: TEST_CONVERSATION_ID,
    otherUserId: TEST_FRIEND_ID,
    otherUserName: "Pelayo Álvarez",
    otherUserUsername: "pelayo_gijon",
    otherUserAvatar: "/images/historical/quini-molinon.jpg",
    unreadCount: 1,
    messages: [
      createMsg("m-1", TEST_CONVERSATION_ID, TEST_FRIEND_ID, "Pelayo Álvarez", "pelayo_gijon", "¡Hola! ¿Qué tal ves al Sporting para esta jornada? ¡Puxa Sporting!", 8, false, "/images/historical/quini-molinon.jpg"),
    ],
  },
  {
    id: "conv-test-cova",
    otherUserId: "user-test-cova",
    otherUserName: "Covadonga Menéndez",
    otherUserUsername: "cova_sportinguista",
    otherUserAvatar: "/images/historical/villamarin-2015.jpg",
    unreadCount: 2,
    messages: [
      createMsg("m-2-1", "conv-test-cova", "me", "Tú", "mareona", "¿Al final vais al Molinón este fin de semana?", 120, true),
      createMsg("m-2-2", "conv-test-cova", "user-test-cova", "Covadonga Menéndez", "cova_sportinguista", "¡Sí! Sacamos entradas en Tribuna Oeste. ¿Viste que Cote vuelve de titular?", 22, false, "/images/historical/villamarin-2015.jpg"),
    ],
  },
  {
    id: "conv-test-rodrigo",
    otherUserId: "user-test-rodrigo",
    otherUserName: "Rodrigo Suárez",
    otherUserUsername: "guaje_suarez",
    otherUserAvatar: null,
    unreadCount: 1,
    messages: [
      createMsg("m-r-1", "conv-test-rodrigo", "user-test-rodrigo", "Rodrigo Suárez", "guaje_suarez", "¿Viste el filial en Mareo? Hay un par de chavales con una pinta tremenda.", 45),
    ],
  },
  {
    id: "conv-test-pena",
    otherUserId: "user-test-pena",
    otherUserName: "Peña La 1905",
    otherUserUsername: "pena_la1905",
    otherUserAvatar: "/images/historical/quini-molinon.jpg",
    unreadCount: 3,
    messages: [
      createMsg("m-p-1", "conv-test-pena", "user-test-pena", "Peña La 1905", "pena_la1905", "¡Atención peñistas! Ya están organizados los autobuses para Santander.", 75, false, "/images/historical/quini-molinon.jpg"),
    ],
  },
  {
    id: "conv-test-nacho",
    otherUserId: "user-test-nacho",
    otherUserName: "Nacho Fernández",
    otherUserUsername: "nacho_molinon",
    otherUserAvatar: null,
    unreadCount: 0,
    messages: [
      createMsg("m-n-1", "conv-test-nacho", "user-test-nacho", "Nacho Fernández", "nacho_molinon", "Quedamos a las 15:30 en los aledaños antes de entrar a la grada.", 240),
    ],
  },
  {
    id: "conv-test-mateo",
    otherUserId: "user-test-mateo",
    otherUserName: "Mateo García",
    otherUserUsername: "mateo_gijon",
    otherUserAvatar: null,
    unreadCount: 0,
    messages: [
      createMsg("m-m-1", "conv-test-mateo", "user-test-mateo", "Mateo García", "mateo_gijon", "Vaya paradón de Yáñez en el último partido, nos salvó los tres puntos.", 1200),
      createMsg("m-m-2", "conv-test-mateo", "me", "Tú", "mareona", "Totalmente, está a un nivel de Primera División.", 1100, true),
    ],
  },
  {
    id: "conv-test-lucia",
    otherUserId: "user-test-lucia",
    otherUserName: "Lucía Prendes",
    otherUserUsername: "lucia_sporting",
    otherUserAvatar: null,
    unreadCount: 0,
    messages: [
      createMsg("m-l-1", "conv-test-lucia", "user-test-lucia", "Lucía Prendes", "lucia_sporting", "Guardadme sitio cerca de la animación en el fondo sur el sábado.", 2880),
    ],
  },
];

export function isTestConversation(id?: string | null): boolean {
  return id === TEST_CONVERSATION_ID || (typeof id === "string" && id.startsWith("conv-test-"));
}

export function isTestFriend(id?: string | null): boolean {
  return id === TEST_FRIEND_ID || id === "demo-user-1" || (typeof id === "string" && id.startsWith("user-test-"));
}

export function markTestConversationAsRead(conversationId?: string): void {
  const target = testChats.find((c) => c.id === (conversationId || TEST_CONVERSATION_ID));
  if (target) target.unreadCount = 0;
}

export function resetTestUnreadNotification(): void {
  const p = testChats.find((c) => c.id === TEST_CONVERSATION_ID);
  if (p) p.unreadCount = 1;
}

export function getTestDirectMessages(conversationId?: string): readonly DirectMessage[] {
  const chat = testChats.find((c) => c.id === (conversationId || TEST_CONVERSATION_ID));
  return chat ? [...chat.messages] : [...testChats[0].messages];
}

export function getTestDirectConversations(): readonly DirectConversationSummary[] {
  return testChats.map((c) => {
    const lastMsg = c.messages[c.messages.length - 1];
    return {
      id: c.id,
      otherUserId: c.otherUserId,
      otherUserName: c.otherUserName,
      otherUserUsername: c.otherUserUsername,
      otherUserAvatar: c.otherUserAvatar,
      lastMessageBody: lastMsg ? lastMsg.body : null,
      lastMessageCreatedAt: lastMsg ? lastMsg.createdAt : null,
      lastMessageIsMine: lastMsg ? Boolean(lastMsg.isMine) : false,
      unreadCount: c.unreadCount,
    };
  });
}

export function getTestDirectConversation(): DirectConversationSummary {
  return getTestDirectConversations()[0];
}

export function sendTestDirectMessage(body: string, currentUserId?: string, convId?: string): DirectMessage {
  const chat = testChats.find((c) => c.id === (convId || TEST_CONVERSATION_ID)) || testChats[0];
  const userMsg: DirectMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId: chat.id,
    senderId: currentUserId || "user-test",
    senderName: "Tú",
    senderUsername: "mareona",
    senderAvatar: null,
    body,
    createdAt: new Date().toISOString(),
    isMine: true,
  };
  chat.messages.push(userMsg);
  return userMsg;
}
