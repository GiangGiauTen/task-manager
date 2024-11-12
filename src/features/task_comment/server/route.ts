import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, COMMENTS_ID, TASKS_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { getMember } from '@/features/members/utils';
import { createCommentSchema } from '../schemas';
import { TaskComment } from '../types';

const app = new Hono()

  // Lấy danh sách các comment của một task
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        taskId: z.string(),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const { taskId } = c.req.valid('query');
      const user = c.get('user');
      console.log('user', user);
      const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);
      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const comments = await databases.listDocuments<TaskComment>(
        DATABASE_ID,
        COMMENTS_ID,
        [Query.equal('taskId', taskId), Query.orderDesc('$createdAt')],
      );

      return c.json({ data: { ...comments, member } });
    },
  )

  // Tạo mới comment cho một task
  .post(
    '/',
    sessionMiddleware,
    zValidator(
      'json',
      createCommentSchema.extend({
        taskId: z.string().min(1, 'Task ID is required'),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { taskId, content, parentId } = c.req.valid('json');

      // Kiểm tra xem user có phải là member của workspace chứa task này không
      const task = await databases.getDocument(DATABASE_ID, TASKS_ID, taskId);
      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_ID,
        ID.unique(),
        {
          content,
          taskId,
          parentId: parentId || null,
          userId: user.$id,
          $createdAt: new Date().toISOString(),
        },
      );

      return c.json({ data: comment });
    },
  )
  .patch(
    '/:commentId',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        content: z.string().min(1, 'Content is required'),
        taskId: z.string().min(1, 'Task ID is required'),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { content, taskId } = c.req.valid('json');
      const { commentId } = c.req.param();

      // Lấy thông tin comment
      const comment = await databases.getDocument<TaskComment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      // Kiểm tra quyền sở hữu comment
      if (comment.taskId !== taskId || comment.userId !== user.$id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Cập nhật nội dung comment
      const updatedComment = await databases.updateDocument(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
        {
          content,
        },
      );

      return c.json({ data: updatedComment });
    },
  )
  // Xóa một comment
  .delete(
    '/:commentId',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        taskId: z.string().min(1, 'Task ID is required'),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { taskId } = c.req.valid('json');
      const { commentId } = c.req.param();

      // Lấy thông tin comment
      const comment = await databases.getDocument<TaskComment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      // Kiểm tra quyền sở hữu comment
      if (comment.taskId !== taskId || comment.userId !== user.$id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Xóa comment
      await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

      return c.json({
        data: { $id: commentId },
        message: 'Comment deleted successfully',
      });
    },
  );

export default app;
