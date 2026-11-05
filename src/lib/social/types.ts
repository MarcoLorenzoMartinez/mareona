export interface SocialPost {
  readonly id: string;
  readonly userId: string;
  readonly authorName: string;
  readonly authorUsername: string;
  readonly authorAvatar: string | null;
  readonly body: string;
  readonly createdAt: string;
  readonly parentId?: string | null;
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly replies?: readonly SocialPost[];
}
