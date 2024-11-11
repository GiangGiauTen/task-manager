import { Models } from 'node-appwrite';

export type TaskComment = Models.Document & {
  content: string;
  taskId: string;
  parentId: string;
  userId: string;
};
