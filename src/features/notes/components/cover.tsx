'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCoverImage } from '../hooks/use-cover-image';
import { useTrigger } from '@/hooks/use-trigger';
import { useDeleteNote } from '../api/use-delete-note';
import { useGetNote } from '../api/use-get-note';
import { cn } from '@/lib/utils';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  url?: string;
  preview?: boolean;
};

const Cover = ({ preview, url }: Props) => {
  const params = useParams();
  const coverImage = useCoverImage();
  const trigger = useTrigger();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doc, setDoc] = useState<any>(null);

  // Use the `useGetNote` hook to fetch the note details
  const { data: note, isLoading } = useGetNote({
    noteId: params.noteId as string,
  });

  useEffect(() => {
    if (note) {
      setDoc(note); // Set document data once it's fetched
    }
  }, [note]);

  const { mutate: deleteNote } = useDeleteNote();

  const handleDelete = () => {
    if (!doc) return; // Prevent delete if no doc or deletion is in progress

    // Call deleteNote with the noteId
    deleteNote(
      { param: { noteId: doc.$id } },
      {
        onSuccess: () => {
          trigger.activate();
          toast.success('Deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete note!');
        },
      },
    );
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[35vh]" />;
  }

  return (
    <div
      className={cn(
        'relative w-full h-[35vh] group',
        !url && 'h-[12vh]',
        url && 'bg-muted',
      )}>
      {!!url && <Image fill src={url} alt="Cover" className="object-cover" />}

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => {
              coverImage.onReplace(url);
            }}
            className="text-muted-foreground text-xs border-white/50"
            variant="outline"
            size="sm">
            <ImageIcon className="h-4 w-4 mr-2" /> Change cover
          </Button>
          <Button
            onClick={handleDelete}
            className="text-white/80 text-xs"
            variant="destructive"
            size="sm">
            <X className="h-4 w-4 mr-2" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cover;

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
