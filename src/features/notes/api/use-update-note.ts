import { toast } from 'sonner';

import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.notes)[':noteId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notes)[':noteId']['$patch']
>;

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.notes[':noteId']['$patch']({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to update note!');
      }
      return await response.json();
    },

    onSuccess: ({ data }) => {
      toast.success('Note updated!');
      queryClient.invalidateQueries({ queryKey: ['note', data.$id] });
    },
    onError: () => {
      toast.error('Failed to update note!');
    },
  });

  return mutation;
};
