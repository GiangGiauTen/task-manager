import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Required'),
  userId: z.string().trim().min(1, 'Required'),
  content: z.string().trim().optional(),
  workspaceId: z.string().trim().min(1, 'Required'),
  projectId: z.string().trim().min(1, 'Required'),
  coverImage: z.string().trim().optional(),
  coverImageId: z.string().trim().optional(),
  isArchived: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  parentDocument: z.string().trim().optional(),
  icon: z.string().trim().optional(),
});
