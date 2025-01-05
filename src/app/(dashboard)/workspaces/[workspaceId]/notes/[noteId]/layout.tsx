'use client';

import { useGetNote } from '@/features/notes/api/use-get-note'; // Import useGetNote hook
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  // Sử dụng hook useGetNote thay cho getDocumentbyId
  const { data: doc, isLoading } = useGetNote({
    noteId: params.noteId as string,
  });

  useEffect(() => {
    if (!isLoading && !doc) {
      throw Error('page not found');
    }
  }, [doc, isLoading]); // Kiểm tra nếu tài liệu không có khi không còn đang tải

  if (isLoading) {
    return <div>Loading...</div>; // Bạn có thể thay thế bằng skeleton hoặc loading indicator ở đây
  }

  return <main>{children}</main>;
}
