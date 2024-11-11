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
  // .get('/:commentId', sessionMiddleware, async c => {
  //   const databases = c.get('databases');
  //   const user = c.get('user');
  //   const { commentId } = c.req.param();

  //   // Truy vấn comment từ database
  //   const comment = await databases.getDocument<TaskComment>(
  //     DATABASE_ID,
  //     COMMENTS_ID,
  //     commentId,
  //   );

  //   // Kiểm tra xem comment có tồn tại và người dùng có quyền truy cập không
  //   const task = await databases.getDocument(
  //     DATABASE_ID,
  //     TASKS_ID,
  //     comment.taskId,
  //   );
  //   const member = await getMember({
  //     databases,
  //     workspaceId: task.workspaceId,
  //     userId: user.$id,
  //   });

  //   if (!member) {
  //     return c.json({ error: 'Unauthorized' }, 401);
  //   }

  //   return c.json({ data: { ...comment, user } });
  // })
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

  // Cập nhật một comment
  // app.patch(
  //   "/",
  //   sessionMiddleware,
  //   zValidator(
  //     "json",
  //     updateCommentSchema.extend({
  //       commentId: z.string().min(1, "Comment ID is required"),
  //       taskId: z.string().min(1, "Task ID is required"),
  //     })
  //   ),
  //   async (c) => {
  //     const databases = c.get("databases");
  //     const user = c.get("user");
  //     const { taskId, commentId, content } = c.req.valid("json");

  //     const comment = await databases.getDocument<TaskComment>(
  //       DATABASE_ID,
  //       COMMENTS_ID,
  //       commentId
  //     );

  //     if (comment.taskId !== taskId || comment.userId !== user.$id) {
  //       return c.json({ error: "Unauthorized" }, 401);
  //     }

  //     const updatedComment = await databases.updateDocument(
  //       DATABASE_ID,
  //       COMMENTS_ID,
  //       commentId,
  //       {
  //         content,
  //         $updatedAt: new Date().toISOString(),
  //       }
  //     );

  //     return c.json({ data: updatedComment });
  //   }
  // );

  // Xóa một comment
  .delete(
    '/:commentId',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        commentId: z.string().min(1, 'Comment ID is required'),
        taskId: z.string().min(1, 'Task ID is required'),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { taskId, commentId } = c.req.valid('json');

      const comment = await databases.getDocument<TaskComment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      if (comment.taskId !== taskId || comment.userId !== user.$id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

      return c.json({ message: 'Comment deleted successfully' });
    },
  );

export default app;
