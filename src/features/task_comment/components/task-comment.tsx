import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/features/task_comment/api/use-create-comment';
import { useGetComments } from '@/features/task_comment/api/use-get-comments';
import { useDeleteComment } from '@/features/task_comment/api/use-delete-comment';
import { useEditComment } from '@/features/task_comment/api/use-update-comment';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskComment as ITaskComment } from '@/features/task_comment/types';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
interface TaskCommentProps {
  task: Task;
}

export const TaskComment = ({ task }: TaskCommentProps) => {
  const taskId = task.$id;
  const workspaceId = useWorkspaceId();
  const {
    data: commentsData,
    isLoading,
    refetch,
  } = useGetComments({
    taskId,
  });
  const { data: membersData } = useGetMembers({
    workspaceId,
  });

  const [newComment, setNewComment] = useState('');
  const [isReplyingTo, setIsReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const createComment = useCreateComment();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const deleteComment = useDeleteComment();
  const editComment = useEditComment();

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>;
  }

  const comments = commentsData?.documents || [];
  const members = membersData?.documents || [];
  const currentUser = commentsData?.member;

  interface UserMap {
    [userId: string]: string;
  }
  const userIdToNameMap: UserMap = (members ?? []).reduce(
    (acc: UserMap, member) => {
      acc[member.userId] = member.name || member.email;
      return acc;
    },
    {} as UserMap,
  );

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
    if (!currentUser?.userId) {
      toast.error('User ID is required to add a comment');
      return;
    }

    try {
      await createComment.mutateAsync({
        json: {
          taskId,
          content: newComment.trim(),
          userId: currentUser?.userId,
        },
      });

      setNewComment('');

      refetch();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !currentUser?.userId) {
      toast.error('User ID is required to add a reply');
      return;
    }

    try {
      await createComment.mutateAsync({
        json: {
          taskId,
          content: replyContent.trim(),
          parentId,
          userId: currentUser.$id,
        },
      });

      setReplyContent('');
      setIsReplyingTo(null);
      toast.success('Reply added successfully');
      refetch();
    } catch {
      toast.error('Failed to add reply');
    }
  };
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Content is required to update a comment');
      return;
    }

    try {
      await editComment.mutateAsync({
        param: { commentId },
        json: { content: editContent, taskId },
      });
      setEditingCommentId(null);
      toast.success('Comment updated successfully');
      refetch();
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({
        param: { commentId },
        json: { taskId },
      });
      toast.success('Comment deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const renderComment = (comment: ITaskComment, isReply = false) => {
    const replies = groupedComments[comment.$id] || [];
    const commentDate = new Date(comment.$createdAt);
    const userName = userIdToNameMap[comment.userId] || 'Unknown User';

    return (
      <div
        key={comment.$id}
        className={`${isReply ? 'ml-8' : 'border-t'} pt-4`}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <MemberAvatar
                className="size-6"
                fallbackClassname="text-xs"
                name={userName}
              />
              <span className="font-medium">{userName}</span>
              <span className="text-sm text-muted-foreground">
                {format(commentDate, 'MMM d, yyyy HH:mm')}
              </span>
              {comment.userId === currentUser?.userId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-auto">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingCommentId(comment.$id);
                        setEditContent(comment.content);
                      }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.$id)}
                      className="text-red-500">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {editingCommentId === comment.$id ? (
              <>
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={2}
                  className="mb-2 mt-2"
                />
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.$id)}
                  disabled={editComment.isPending}>
                  {editComment.isPending ? 'Updating...' : 'Update Comment'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCommentId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <p className="mt-1 text-sm">{comment.content}</p>
            )}

            <div className="mt-2 flex gap-2">
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
