import { toast } from 'sonner';

import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.task_comment)[':commentId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.task_comment)[':commentId']['$patch']
>;

export const useEditComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.task_comment[':commentId']['$patch']({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to update task comment!');
      }
      return await response.json();
    },

    onSuccess: ({ data }) => {
      toast.success('task Comment updated!');

      queryClient.invalidateQueries({ queryKey: ['task-comment', data.$id] });
    },
    onError: () => {
      toast.error('Failed to update task!');
    },
  });

  return mutation;
};
