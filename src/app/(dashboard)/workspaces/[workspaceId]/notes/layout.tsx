import React from 'react';

import Sidebar from '@/features/notes/components/sidebar-notes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex dark:bg-[#121212] relative">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
