'use client';

import { useEffect, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';

export const MobileSidebar = () => {
  const [IsOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet modal={false} open={IsOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size={'icon'}
          variant="secondary"
          className="lg:hidden size-8  ">
          <MenuIcon className="size-4 text-black-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'} className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
