import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetSidebarParentNoteProps {
  parentDocumentId?: string;
}

export const useGetSidebarParentNote = ({
  parentDocumentId,
}: UseGetSidebarParentNoteProps) => {
  const query = useQuery({
    queryKey: ['sidebarParentNote', parentDocumentId || 'root'],
    queryFn: async () => {
      const response = await client.api.notes['sidebarParent'].$get({
        query: parentDocumentId ? { parentDocument: parentDocumentId } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sidebar parent notes!');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
