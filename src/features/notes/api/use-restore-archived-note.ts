import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferResponseType, InferRequestType } from 'hono';

type ResponseType = InferResponseType<
  (typeof client.api.notes)[':noteId']['restore']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notes)[':noteId']['restore']['$patch']
>;

export const useRestoreArchivedNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.notes[':noteId']['restore']['$patch']({
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to restore note!');
      }
      return await response.json();
    },

    onSuccess: () => {
      toast.success('Note restored successfully!');

      // Invalidate the "trash" query to refresh the archived notes list
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      toast.error('Failed to restore note!');
    },
  });

  return mutation;
};
