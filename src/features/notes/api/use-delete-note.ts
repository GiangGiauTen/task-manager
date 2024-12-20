import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.notes)[':noteId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notes)[':noteId']['$delete']
>;

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.notes[':noteId']['$delete']({ param });

      if (!response.ok) {
        throw new Error('Failed to delete note!');
      }
      return await response.json();
    },

    onSuccess: ({}) => {
      toast.success('Note deleted!');

      queryClient.invalidateQueries({ queryKey: ['workspace-notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      toast.error('Failed to delete note!');
    },
  });

  return mutation;
};
