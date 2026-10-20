export interface MatchComment {
  readonly id: string;
  readonly matchId: string;
  readonly parentId?: string | null;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorUsername: string;
  readonly authorAvatar?: string | null;
  readonly body: string;
  readonly createdAt: string;
  readonly likesCount: number;
  readonly hasLiked?: boolean;
  readonly replies?: readonly MatchComment[];
}

export interface MatchMvpCandidate {
  readonly playerId: string;
  readonly playerName: string;
  readonly shirtNumber?: string;
  readonly photoUrl?: string | null;
  readonly votesCount: number;
}

export interface MatchPlayerRatingItem {
  readonly targetId: string;
  readonly targetName: string;
  readonly targetRole: "player" | "coach";
  readonly shirtNumber?: string;
  readonly photoUrl?: string | null;
  readonly averageRating: number;
  readonly totalRatings: number;
  readonly userRating?: number | null;
}

export interface MatchCommunityData {
  readonly matchId: string;
  readonly comments: readonly MatchComment[];
  readonly mvpCandidates: readonly MatchMvpCandidate[];
  readonly userMvpVotePlayerId?: string | null;
  readonly ratings: readonly MatchPlayerRatingItem[];
}
