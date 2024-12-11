import { Button } from '@/components/ui/button';
import { useTrigger } from '@/hooks/use-trigger';
import { useDeleteNote } from '../api/use-delete-note';
import { useRestoreArchivedNote } from '../api/use-restore-archived-note';
import React from 'react';
import { toast } from 'sonner';
import ConfirmDailog from '@/components/confirmDialog';

type Props = {
  noteId?: string;
};

const Banner = ({ noteId }: Props) => {
  const trigger = useTrigger();
  const { mutate: restoreNote } = useRestoreArchivedNote();
  const { mutate: deleteNote } = useDeleteNote();

  const handleRestore = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    noteId: string,
  ) => {
    e.stopPropagation();

    const restore = new Promise<void>((resolve, reject) => {
      restoreNote(
        { param: { noteId } },
        {
          onSuccess: () => {
            trigger.activate();
            resolve();
          },
          onError: err => {
            reject(err);
          },
        },
      );
    });

    toast.promise(restore, {
      loading: 'Restoring note... ⏪',
      success: 'Note restored successfully! 📓',
      error: 'Failed to restore note 😢',
    });
  };

  const handleRemove = async (noteId: string) => {
    const documents = new Promise<void>((resolve, reject) => {
      deleteNote(
        { param: { noteId } },
        {
          onSuccess: () => {
            trigger.activate();
            resolve();
          },
          onError: err => {
            reject(err);
          },
        },
      );
    });

    toast.promise(documents, {
      loading: 'Deleting note permanently... ⏪',
      success: 'Note deleted successfully! 📓',
      error: 'Failed to delete note 😢',
    });
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-4 justify-center">
      <p className="font-mono font-thin">Current page is inside page...</p>

      <Button
        size="sm"
        onClick={e => handleRestore(e, noteId as string)}
        variant={'outline'}
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal">
        Restore
      </Button>
      <ConfirmDailog onConfirm={() => handleRemove(noteId as string)}>
        <Button
          size="sm"
          variant={'primary'}
          className="bg-white text-black hover:bg-white/80 p-1 px-2 h-auto font-normal">
          Delete Permanently
        </Button>
      </ConfirmDailog>
    </div>
  );
};

export default Banner;
