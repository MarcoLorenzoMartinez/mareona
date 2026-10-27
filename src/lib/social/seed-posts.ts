import type { SocialPost } from "./types";
import type { FriendSummary } from "./friendship-schemas";

/**
 * Initial community discussion seeds for offline / development / demo preview.
 * Includes official presets and real sporting club imagery for realism.
 */
export const INITIAL_TERTULIA_POSTS: readonly SocialPost[] = [
  {
    id: "tertulia-post-1",
    userId: "demo-user-1",
    authorName: "Pelayo Álvarez",
    authorUsername: "pelayo_gijon",
    authorAvatar: "/images/players/10.png",
    body: "¿Qué os pareció el planteamiento táctico del último partido? Creo que la presión tras pérdida en El Molinón fue la clave para dominar el centro del campo.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    likesCount: 14,
    repliesCount: 2,
    replies: [
      {
        id: "tertulia-reply-1",
        userId: "demo-user-2",
        authorName: "Nacho RSG",
        authorUsername: "nacho_sporting",
        authorAvatar: "/images/players/7.png",
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
    authorAvatar: "/images/players/21.png",
    body: "¿Quién viaja este fin de semana con la Mareona? Estamos organizando autobuses desde la peña para animar al equipo fuera de casa.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likesCount: 22,
    repliesCount: 0,
    replies: [],
  },
];

/**
 * Fallback demo search profiles with realistic avatars for interactive test demos.
 */
export const DEMO_SEARCH_AFICIONADOS: readonly FriendSummary[] = [
  {
    id: "demo-user-1",
    friendshipId: "",
    username: "pelayo_gijon",
    displayName: "Pelayo Álvarez",
    avatarUrl: "/images/players/10.png",
  },
  {
    id: "demo-user-2",
    friendshipId: "",
    username: "nacho_sporting",
    displayName: "Nacho RSG",
    avatarUrl: "/images/players/7.png",
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
    avatarUrl: "/images/players/21.png",
  },
  {
    id: "demo-user-5",
    friendshipId: "",
    username: "rodrigo_mareo",
    displayName: "Rodrigo Mareo",
    avatarUrl: "/images/players/23.png",
  },
];
