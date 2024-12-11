import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface useGetNoteProps {
  noteId: string;
}

export const useGetNote = ({ noteId }: useGetNoteProps) => {
  const query = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const response = await client.api.notes[':noteId'].$get({
        param: {
          noteId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch note!');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
