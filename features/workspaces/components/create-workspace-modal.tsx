'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { CreateWorkspaceForm } from './create-workspace-form';
import { useCreateWorkspaceModal } from '../hooks/use-workspace-model';

export const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};
