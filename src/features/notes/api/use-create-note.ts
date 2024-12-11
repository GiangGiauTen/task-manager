import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.notes)['$post'], 200>;
type RequestType = InferRequestType<(typeof client.api.notes)['$post']>;

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.notes['$post']({ json });

      if (!response.ok) {
        throw new Error('Failed to create note!');
      }
      return await response.json();
    },

    onSuccess: () => {
      toast.success('Note created!');
      console.log('client.api', client.api);
      queryClient.invalidateQueries({ queryKey: ['workspace-notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      toast.error('Failed to create note!');
    },
  });

  return mutation;
};
