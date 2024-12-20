'use client';

import { ChevronLeftIcon as LeftIcon, MenuIcon, Plus } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { PlusCircle } from 'lucide-react';
import Item from './item';
import NoteList from './noteList';
import { Trash2 } from 'lucide-react';
// import TrashBox from './trashBox';
// import { useSearch } from '@/hooks/useSearch';
import { useCurrent } from '@/features/auth/api/use-current';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import Navbar from './navbar';
import { useTrigger } from '@/hooks/use-trigger';
import { useCreateNote } from '../api/use-create-note';
import { toast } from 'sonner';

// type Props = {};

const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isResizeRef = useRef(false);
  const sidebarRef = useRef<ElementRef<'aside'>>(null);
  const navbarRef = useRef<ElementRef<'header'>>(null);
  const [reset, setReset] = useState(false);
  const [collapsed, setCollapsed] = useState(isMobile);
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data: user } = useCurrent();
  // const search = useSearch();
  const userId = user?.$id || '';
  const trigger = useTrigger();
  const router = useRouter();
  const createNoteMutation = useCreateNote();

  useEffect(() => {
    if (isMobile) {
      handleCollapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      handleCollapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    isResizeRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizeRef.current) return;
    let newWidth = e.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty('left', `${newWidth}px`);
      navbarRef.current.style.setProperty(
        'width',
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  const handleMouseUp = () => {
    isResizeRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setCollapsed(false);
      setReset(true);

      sidebarRef.current.style.width = isMobile ? '100%' : '240px';
      navbarRef.current.style.setProperty(
        'width',
        isMobile ? '0' : 'calc(100% - 240px)',
      );
      navbarRef.current.style.setProperty('left', isMobile ? '100%' : '240px');

      setTimeout(() => setReset(false), 300);
    }
  };

  const handleCollapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setCollapsed(true);
      setReset(true);

      sidebarRef.current.style.width = '0';
      navbarRef.current.style.setProperty('width', '100%');
      navbarRef.current.style.setProperty('left', '0');

      setTimeout(() => setReset(false), 300);
    }
  };

  const handleCreate = () => {
    toast.promise(
      createNoteMutation.mutateAsync({
        json: { workspaceId, userId, projectId, title: 'Untitled' },
      }),
      {
        loading: 'Creating note for you... 👾',
        success: () => {
          trigger.activate(); // Refresh dữ liệu sau khi tạo ghi chú
          return 'New note created for you! 📓';
        },
        error: 'Failed to create note 😢',
      },
    );
  };
  return (
    <>
      <aside
        ref={sidebarRef}
        className={`group/sidebar h-full bg-primary/5 overflow-y-auto relative flex w-60 flex-col z-[99999] ${
          reset ? 'transition-all ease-linear duration-300' : ''
        } ${isMobile ? 'w-0' : ''}`}>
        <div
          onClick={handleCollapse}
          role="button"
          className={`h-6 w-6 text-muted-foreground rounded-sm hover:bg-primary/10 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition cursor-pointer ${
            isMobile ? 'opacity-100' : ''
          }`}>
          <LeftIcon className="h-6 w-6" />
        </div>

        <div>
          <Item onClick={handleCreate} label="New Page" icon={PlusCircle} />
        </div>

        <div className="mt-4">
          <p>
            <NoteList />
            <Item onClick={handleCreate} icon={Plus} label="Add a Page" />

            <Popover>
              <PopoverTrigger
                onClick={() => {
                  trigger.activate();
                }}
                className="w-full mt-4">
                <Item icon={Trash2} label="Trash" />
              </PopoverTrigger>
              <PopoverContent
                side={isMobile ? 'bottom' : 'right'}
                className="p-0 w-72"></PopoverContent>
            </Popover>
          </p>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition-all duration-100 ease-linear cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>

      <header
        ref={navbarRef}
        className={`absolute top-0 z-[99999] left-60 w-[calc(100%-240px)] ${
          reset ? 'transition-all ease-linear duration-300' : ''
        } ${isMobile ? 'left-0 w-full' : ''}`}>
        {!!params.noteId ? (
          <Navbar isCollapsed={collapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {collapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </header>
    </>
  );
};

export default Sidebar;
