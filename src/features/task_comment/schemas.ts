import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Required'), // Nội dung bình luận, yêu cầu không rỗng
  taskId: z.string().trim().min(1, 'Required'), // ID của task, yêu cầu không rỗng
  parentId: z.string().trim().optional(), // ID của comment cha nếu có, tùy chọn
  userId: z.string().trim().min(1, 'Required'), // ID của người dùng, yêu cầu không rỗng
});
