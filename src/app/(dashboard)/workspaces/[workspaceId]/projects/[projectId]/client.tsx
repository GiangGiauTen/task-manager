'use client';

import { useState } from 'react';
import { Analytics } from '@/components/analytics';
import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { useGetProject } from '@/features/projects/api/use-get-project';
import { useGetProjectAnalytics } from '@/features/projects/api/use-get-project-analytics';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { TaskViewSwitcher } from '@/features/tasks/components/task-view-switcher';
import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import NoteView from '@/features/notes/components/note-view';
export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetProjectAnalytics({ projectId });
  const [activeView, setActiveView] = useState<'tasks' | 'notes'>('tasks');
  const isLoading = isLoadingProject || isLoadingAnalytics;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="Project not found!" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold"> {project.name}</p>
        </div>
        <div>
          <Button variant={'secondary'} size={'sm'} asChild>
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
              <PencilIcon className="size-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-start gap-x-4 border-b pb-2">
        <Button
          variant={activeView === 'tasks' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('tasks')}>
          Tasks
        </Button>
        <Button
          variant={activeView === 'notes' ? 'primary' : 'ghost'}
          onClick={() => setActiveView('notes')}>
          Notes
        </Button>
      </div>
      {activeView === 'tasks' && (
        <div>
          {analytics ? <Analytics data={analytics} /> : null}
          <TaskViewSwitcher hideProjectFilter />
        </div>
      )}
      {activeView === 'notes' && <NoteView />}
    </div>
  );
};
