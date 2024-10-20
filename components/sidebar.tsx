import Image from 'next/image';
import Link from 'next/link';
import { DottedSeparator } from './ui/dottedSeparator';
import { Navigation } from './navigation';
import { WorkspaceSwitcher } from './workspace-switcher';
export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-50 p-4 w-full">
      <Link href={'/'}>
        <Image src={'/logo.svg'} alt="logo" width={164} height={45} />
      </Link>
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
    </aside>
  );
};
