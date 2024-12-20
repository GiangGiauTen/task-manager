import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrent } from '@/features/auth/api/use-current';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { useTrigger } from '@/hooks/use-trigger';
import { useCreateNote } from '../api/use-create-note';
import { useSetNoteAsArchive } from '../api/use-set-note-as-archive';

import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  PlusIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { toast } from 'sonner';

type Props = {
  noteId?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
};

const Item = ({
  noteId,
  documentIcon,
  isSearch,
  active,
  expanded,
  onExpand,
  level = 0,
  icon: Icon,
  label,
  onClick,
}: Props) => {
  const { data: user } = useCurrent();
  const router = useRouter();
  const trigger = useTrigger();
  const archiveNoteMutation = useSetNoteAsArchive();
  const createNoteMutation = useCreateNote();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  // expand function
  const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e?.stopPropagation();
    onExpand?.();
  };

  // archive function
  const handleArchive = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e?.stopPropagation();

    if (!noteId) return;

    const promise = archiveNoteMutation
      .mutateAsync({ param: { noteId: noteId } })
      .then(() => {
        // router.push("/dashboard");
        trigger.activate();
      });

    toast.promise(promise, {
      loading: 'Moving to trash... 🙂',
      success: 'Note moved to trash! 🚮',
      error: 'Failed to archive note. 😢',
    });
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  const handleCreate = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    if (!noteId) return;

    const promise = createNoteMutation
      .mutateAsync({
        json: {
          userId: user?.$id || '',
          title: 'Untitled',
          parentDocument: noteId,
          workspaceId: workspaceId,
          projectId: projectId,
        },
      })
      .then(() => {
        if (!expanded) {
          onExpand?.();
          trigger.activate();
        }
      });

    toast.promise(promise, {
      loading: 'Creating note for you... 👾',
      success: 'New note created for you! 📓',
      error: 'Failed to create note 😢',
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        paddingLeft: level ? `${level * 12 + 12}px` : '12px',
      }}
      className={`group min-h-[27px] text-sm py-2 pr-3 w-full hover:bg-primary/5 flex items-center gap-2 text-muted-foreground font-medium ${
        active ? 'bg-primary/5 text-primary' : ''
      }`}>
      {!!noteId && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-primary/10 mr-1"
          onClick={handleExpand}>
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      )}

      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{label}</span>

      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}

      {!!noteId && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={e => e.stopPropagation()} asChild>
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-primary/10">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60"
              align="start"
              side="right"
              forceMount>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleArchive}>
                <BsTrash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.name}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            role="button"
            onClick={handleCreate}
            className="opacity-0 group-hover:opacity-100 rounded-sm h-full ml-auto hover:bg-primary/10 ">
            <PlusIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Item;

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : '12px' }}
      className="flex items-center gap-x-2 py-[3px]">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[65%]" />
    </div>
  );
};
