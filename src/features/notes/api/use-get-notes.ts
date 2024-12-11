import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface useGetNotesProps {
  workspaceId: string;
  projectId?: string | null;
  parentDocument?: string | null;
  isArchived?: boolean;
  isPublished?: boolean;
}

export const useGetNotes = ({
  workspaceId,
  projectId,
  parentDocument,
  isArchived,
  isPublished,
}: useGetNotesProps) => {
  const query = useQuery({
    queryKey: [
      'notes',
      workspaceId,
      projectId,
      parentDocument,
      isArchived,
      isPublished,
    ],
    queryFn: async () => {
      const response = await client.api.notes.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          parentDocument: parentDocument ?? undefined,
          isArchived: isArchived !== undefined ? String(isArchived) : undefined,
          isPublished:
            isPublished !== undefined ? String(isPublished) : undefined,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes!');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
