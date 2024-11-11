import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface useGetCommentsProps {
  taskId: string;
  userId?: string | null;
  content?: string | null;
}

export const useGetComments = ({ taskId }: useGetCommentsProps) => {
  const query = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const response = await client.api.task_comment.$get({
        query: {
          taskId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comment!');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
