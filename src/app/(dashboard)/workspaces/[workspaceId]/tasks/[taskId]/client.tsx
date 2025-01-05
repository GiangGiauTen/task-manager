'use client';

import { DottedSeparator } from '@/components/dotted-separator';
import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { TaskComment } from '@/features/task_comment/components/task-comment';
import { useGetTask } from '@/features/tasks/api/use-get-task';
import { TaskBreadcrumbs } from '@/features/tasks/components/task-breadcrumbs';
import { TaskDescription } from '@/features/tasks/components/task-description';
import { TaskOverview } from '@/features/tasks/components/task-overview';
import { useTaskId } from '@/features/tasks/hooks/use-task-id';
import { GeminiAIInteraction } from '@/features/tasks/components/gemini-ai-interaction';

export const TaskIdClient = () => {
  const taskId = useTaskId();
  const { data, isLoading } = useGetTask({ taskId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError message="Task not found" />;
  }
  const taskContext = `
    Task Details:
    - Assignee: ${data.assignee.name || 'N/A'}
    - Due Date: ${data.dueDate || 'N/A'}
    - Status: ${data.status || 'N/A'}
    - Description: ${data.description || 'No description provided.'}
  `;
  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs project={data.project} task={data} />
      <DottedSeparator classname="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview task={data} />
        <TaskDescription task={data} />
        <TaskComment task={data} />
        <GeminiAIInteraction context={taskContext} />
      </div>
    </div>
  );
};
