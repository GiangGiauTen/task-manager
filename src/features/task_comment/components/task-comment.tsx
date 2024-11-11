import { useState } from 'react';
import { Task } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/features/task_comment/api/use-create-comment';
import { useGetComments } from '@/features/task_comment/api/use-get-comments';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskComment as ITaskComment } from '@/features/task_comment/types';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
interface TaskCommentProps {
  task: Task;
}

export const TaskComment = ({ task }: TaskCommentProps) => {
  const taskId = task.$id;

  const { data: commentsData, isLoading } = useGetComments({
    taskId,
  });
  const [newComment, setNewComment] = useState('');
  const [isReplyingTo, setIsReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const createComment = useCreateComment();

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>;
  }

  const comments = commentsData?.documents || [];
  const currentUser = commentsData?.member;

  // Group comments by parent ID
  const groupedComments = comments.reduce(
    (acc: Record<string, ITaskComment[]>, comment: ITaskComment) => {
      const parentId = comment.parentId || 'root';
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(comment);
      return acc;
    },
    {},
  );

  const rootComments = groupedComments['root'] || [];

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('newComment is required to add a comment');
      return;
    }
    if (!currentUser?.$id) {
      toast.error('User ID is required to add a comment');
      return;
    }

    try {
      await createComment.mutateAsync({
        json: {
          taskId,
          content: newComment.trim(),
          userId: currentUser?.$id,
        },
      });

      setNewComment('');
      toast.success('Comment added successfully');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !currentUser?.$id) {
      toast.error('User ID is required to add a reply');
      return;
    }

    try {
      await createComment.mutateAsync({
        json: {
          taskId,
          content: replyContent.trim(),
          parentId,
          userId: currentUser.$id, // userId is now guaranteed to be defined
        },
      });

      setReplyContent('');
      setIsReplyingTo(null);
      toast.success('Reply added successfully');
    } catch {
      toast.error('Failed to add reply');
    }
  };

  const renderComment = (comment: ITaskComment, isReply = false) => {
    const replies = groupedComments[comment.$id] || [];
    const commentDate = new Date(comment.$createdAt);

    return (
      <div
        key={comment.$id}
        className={`${isReply ? 'ml-8' : 'border-t'} pt-4`}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{comment.user?.name}</span>
              <span className="text-sm text-muted-foreground">
                {format(commentDate, 'MMM d, yyyy HH:mm')}
              </span>
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>

            {!isReply && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setIsReplyingTo(
                      isReplyingTo === comment.$id ? null : comment.$id,
                    )
                  }>
                  Reply
                </Button>
              </div>
            )}

            {isReplyingTo === comment.$id && (
              <div className="mt-4">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  rows={2}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => handleAddReply(comment.$id)}
                  disabled={createComment.isPending}>
                  {createComment.isPending ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            )}

            {replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        <div className="mb-6">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <Button onClick={handleAddComment} disabled={createComment.isPending}>
            {createComment.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>

        <div className="space-y-4">
          {rootComments.map(comment => renderComment(comment))}
        </div>
      </div>
    </div>
  );
};
