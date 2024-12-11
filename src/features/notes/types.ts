import { Models } from 'node-appwrite';

export type Note = Models.Document & {
  workspaceId: string;
  projectId: string;
  userId: string;
  title: string;
  coverImage?: File[];
  coverImageId?: string;
  content?: string;
  isArchived?: boolean;
  parentDocument?: string;
  isPublished?: boolean;
  icon?: string;
};
