import type { MatchComment } from "./types";

export const SEED_MATCH_COMMENTS: readonly MatchComment[] = [
  {
    id: "mc-1",
    matchId: "demo",
    authorId: "user-pelayo",
    authorName: "Pelayo González",
    authorUsername: "pelayogs",
    authorAvatar: null,
    body: "¡Gran intensidad en los duelos individuales! La salida de balón por banda derecha está haciendo muchísimo daño.",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    likesCount: 8,
    hasLiked: false,
    replies: [
      {
        id: "mc-1-1",
        matchId: "demo",
        parentId: "mc-1",
        authorId: "user-covadonga",
        authorName: "Covadonga Álvarez",
        authorUsername: "cova_sporting",
        authorAvatar: null,
        body: "Totalmente de acuerdo, el repliegue defensivo además está siendo impecable.",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        likesCount: 3,
        hasLiked: false,
      },
    ],
  },
  {
    id: "mc-2",
    matchId: "demo",
    authorId: "user-rodrigo",
    authorName: "Rodrigo Menéndez",
    authorUsername: "rodrigo_rsg",
    authorAvatar: null,
    body: "Molinón ruge como en las grandes tardes. ¡Puxa Sporting!",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    likesCount: 14,
    hasLiked: false,
    replies: [],
  },
];
