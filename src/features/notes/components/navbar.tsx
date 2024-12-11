'use client';

import { useGetNote } from '../api/use-get-note';
import { MenuIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';
import Title from './title';
import Banner from './banner';
import Menu from './menu';
// import Publish from '@/components/others/publish';

type Props = {
  isCollapsed: boolean;
  onResetWidth: () => void;
};

const Navbar = ({ isCollapsed, onResetWidth }: Props) => {
  const params = useParams();

  // Fetch note data using useGetNote
  const {
    data: doc,
    isLoading,
    isError,
  } = useGetNote({
    noteId: params.noteId as string,
  });

  // Loading state
  if (isLoading) {
    return (
      <nav className="bg-background dark:bg-[#121212] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  // Error state or no data
  if (isError || !doc) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#121212] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}

        <div className="flex items-center justify-between w-full">
          <Title initialData={doc} />
          <div className="flex items-center gap-x-2">
            {/* <Publish initalData={doc} /> */}
            <Menu noteId={doc.$id} />
          </div>
        </div>
      </nav>

      {doc.isArchived && <Banner noteId={doc.$id} />}
    </>
  );
};

export default Navbar;
