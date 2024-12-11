import { toast } from 'sonner';

import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.notes)[':noteId']['archive']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notes)[':noteId']['archive']['$patch']
>;

export const useSetNoteAsArchive = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.notes[':noteId']['archive']['$patch']({
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to archive note!');
      }
      return await response.json();
    },

    onSuccess: ({}) => {
      toast.success('Note archived successfully!');

      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      toast.error('Failed to archive note!');
    },
  });

  return mutation;
};
