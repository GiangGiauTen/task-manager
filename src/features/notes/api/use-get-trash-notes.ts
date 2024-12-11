import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface useGetTrashNotesProps {
  workspaceId: string;
}

export const useGetTrashNotes = ({ workspaceId }: useGetTrashNotesProps) => {
  const query = useQuery({
    queryKey: ['trashNotes', workspaceId],
    queryFn: async () => {
      const response = await client.api.notes.$get({
        query: {
          workspaceId,
          isArchived: 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch archived notes!');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
