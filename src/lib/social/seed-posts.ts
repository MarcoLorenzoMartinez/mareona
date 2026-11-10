import type { SocialPost } from "./types";
import type { FriendSummary } from "./friendship-schemas";
import { TEST_FRIEND_ID } from "./test-friend-chat";

/**
 * Initial community discussion seeds for offline / development / demo preview.
 * Uses historical photos and official presets to avoid confusing with current players.
 */
export const INITIAL_TERTULIA_POSTS: readonly SocialPost[] = [
  {
    id: "tertulia-post-1",
    userId: TEST_FRIEND_ID,
    authorName: "Pelayo Álvarez",
    authorUsername: "pelayo_gijon",
    authorAvatar: "/images/historical/quini-molinon.jpg",
    body: "¿Qué os pareció el planteamiento táctico del último partido? Creo que la presión tras pérdida en El Molinón fue la clave para dominar el centro del campo.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    likesCount: 14,
    repliesCount: 2,
    poll: {
      id: "demo-poll-1",
      postId: "tertulia-post-1",
      options: [
        { id: "opt-1", label: "Muy bien planteado", votesCount: 28 },
        { id: "opt-2", label: "Faltó más puntería", votesCount: 14 },
        { id: "opt-3", label: "Se pudo mejorar atrás", votesCount: 5 },
      ],
      totalVotes: 47,
      userVotedOptionId: null,
    },
    replies: [
      {
        id: "tertulia-reply-1",
        userId: "demo-user-2",
        authorName: "Nacho RSG",
        authorUsername: "nacho_sporting",
        authorAvatar: "/images/historical/el-molinon-uefa.jpg",
        body: "Totalmente de acuerdo, Pelayo. Hacía tiempo que no veía tanta intensidad física en los primeros 45 minutos.",
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        likesCount: 5,
        repliesCount: 0,
      },
      {
        id: "tertulia-reply-2",
        userId: "demo-user-3",
        authorName: "Covadonga",
        authorUsername: "cova_molinon",
        authorAvatar: "/avatars/presets/bufanda.svg",
        body: "Y mención especial a la cantera. Los chavales de Mareo están dando un paso al frente tremendo.",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        likesCount: 8,
        repliesCount: 0,
      },
    ],
  },
  {
    id: "tertulia-post-2",
    userId: "demo-user-4",
    authorName: "Marcos Gijonés",
    authorUsername: "marcos_rsg",
    authorAvatar: "/images/historical/villamarin-2015.jpg",
    body: "¿Quién viaja este fin de semana con la Mareona? Estamos organizando autobuses desde la peña para animar al equipo fuera de casa.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likesCount: 22,
    repliesCount: 0,
    replies: [],
  },
];

/**
 * Fallback demo search profiles with historical photos and presets.
 */
export const DEMO_SEARCH_AFICIONADOS: readonly FriendSummary[] = [
  {
    id: TEST_FRIEND_ID,
    friendshipId: "",
    username: "pelayo_gijon",
    displayName: "Pelayo Álvarez",
    avatarUrl: "/images/historical/quini-molinon.jpg",
  },
  {
    id: "demo-user-2",
    friendshipId: "",
    username: "nacho_sporting",
    displayName: "Nacho RSG",
    avatarUrl: "/images/historical/el-molinon-uefa.jpg",
  },
  {
    id: "demo-user-3",
    friendshipId: "",
    username: "cova_molinon",
    displayName: "Covadonga",
    avatarUrl: "/avatars/presets/bufanda.svg",
  },
  {
    id: "demo-user-4",
    friendshipId: "",
    username: "marcos_rsg",
    displayName: "Marcos Gijonés",
    avatarUrl: "/images/historical/villamarin-2015.jpg",
  },
  {
    id: "demo-user-5",
    friendshipId: "",
    username: "rodrigo_mareo",
    displayName: "Rodrigo Mareo",
    avatarUrl: "/images/historical/escuela-de-mareo.jpg",
  },
];
