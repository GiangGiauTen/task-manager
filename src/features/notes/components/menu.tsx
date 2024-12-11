import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useCurrent } from '@/features/auth/api/use-current';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon } from 'lucide-react';
import { BsTrash } from 'react-icons/bs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrigger } from '@/hooks/use-trigger';
import { useSetNoteAsArchive } from '../api/use-set-note-as-archive';

type Props = {
  noteId: string;
};

const Menu = ({ noteId }: Props) => {
  const { data: user } = useCurrent();
  const trigger = useTrigger();
  const { mutate: archiveNote } = useSetNoteAsArchive();

  const handleArchive = () => {
    const archive = new Promise<void>((resolve, reject) => {
      archiveNote(
        { param: { noteId: noteId } },
        {
          onSuccess: () => {
            trigger.activate(); // Refresh dữ liệu sau khi ghi chú được lưu trữ
            resolve();
          },
          onError: error => {
            reject(error);
          },
        },
      );
    });

    toast.promise(archive, {
      loading: 'Moving to trash... 🙂',
      success: 'Note moved to trash! 🚮',
      error: 'Failed to archive note. 😢',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount>
        <DropdownMenuItem className="cursor-pointer" onClick={handleArchive}>
          <BsTrash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.name}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-5 w-7" />;
};
