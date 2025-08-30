import z from "zod";

// Article Status enum
export const ArticleStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
  HIDDEN: 'hidden'
} as const;

export type ArticleStatusType = typeof ArticleStatus[keyof typeof ArticleStatus];

// Zod schemas for API validation
export const CreateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10, "Too many tags").optional()
});

export const UpdateArticleSchema = CreateArticleSchema.partial().extend({
  id: z.number()
});

export const CreateCommentSchema = z.object({
  articleId: z.number(),
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
  parentCommentId: z.number().optional()
});

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3, "Username too short").max(30, "Username too long").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

// Type definitions
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  authorId: string;
  status: ArticleStatusType;
  publishedAt?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleWithAuthor extends Article {
  author: UserProfile;
  tags: string[];
  isLikedByUser?: boolean;
}

export interface UserProfile {
  id: number;
  mochaUserId: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  articleId: number;
  authorId: string;
  content: string;
  parentCommentId?: number;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  author: UserProfile;
  replies?: Comment[];
}

export interface ArticleLike {
  id: number;
  articleId: number;
  userId: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  author?: string;
  status?: ArticleStatusType;
  sortBy?: 'latest' | 'oldest' | 'popular' | 'trending';
}
