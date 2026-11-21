export interface PollOption {
  readonly id: string;
  readonly label: string;
  readonly votesCount: number;
}

export interface SocialPoll {
  readonly id: string;
  readonly postId: string;
  readonly options: readonly PollOption[];
  readonly totalVotes: number;
  readonly userVotedOptionId?: string | null;
}

export interface SocialPost {
  readonly id: string;
  readonly userId: string;
  readonly authorName: string;
  readonly authorUsername: string;
  readonly authorAvatar: string | null;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
  readonly isEdited?: boolean;
  readonly parentId?: string | null;
  readonly matchId?: string | null;
  readonly matchLabel?: string | null;
  readonly likesCount: number;
  readonly userHasLiked?: boolean;
  readonly repliesCount: number;
  readonly replies?: readonly SocialPost[];
  readonly poll?: SocialPoll | null;
}
