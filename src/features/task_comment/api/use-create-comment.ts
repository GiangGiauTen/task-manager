import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.task_comment)['$post'],
  200
>;
type RequestType = InferRequestType<(typeof client.api.task_comment)['$post']>;

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.task_comment['$post']({ json });

      if (!response.ok) {
        throw new Error('Failed to create comment!');
      }
      return await response.json();
    },

    onSuccess: () => {
      toast.success('Task created!');
      queryClient.invalidateQueries({ queryKey: ['task-comment'] });
    },
    onError: () => {
      toast.error('Failed to create comment!');
    },
  });

  return mutation;
};
