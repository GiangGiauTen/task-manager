import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.task_comment)[':commentId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.task_comment)[':commentId']['$delete']
>;

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.task_comment[':commentId']['$delete']({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to delete Comment!');
      }
      return await response.json();
    },

    onSuccess: ({ data }) => {
      toast.success('Comment deleted!');

      queryClient.invalidateQueries({ queryKey: ['task-comment', data.$id] });
    },
    onError: () => {
      toast.error('Failed to delete Comment!');
    },
  });

  return mutation;
};
