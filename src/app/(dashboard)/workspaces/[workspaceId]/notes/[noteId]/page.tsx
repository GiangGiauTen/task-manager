// 'use client';

// import Cover from '@/features/notes/components/cover';
// import { Skeleton } from '@/components/ui/skeleton';
// import { useTrigger } from '@/hooks/use-trigger';
// import { useGetNote } from '@/features/notes/api/use-get-note'; // Import hook useGetNote
// import dynamic from 'next/dynamic';
// import { useParams } from 'next/navigation';
// import React, { useEffect, useState } from 'react';

// const DocumentsPage = () => {
//   const params = useParams();
//   const trigger = useTrigger();

//   // Sử dụng hook useGetNote thay vì getDocumentbyId
//   const { data: doc, isLoading } = useGetNote({
//     noteId: params.noteId as string,
//   });

//   if (isLoading) {
//     return (
//       <div>
//         <Cover.Skeleton />
//         <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
//           <div className="space-y-4 pl-8 pt-4">
//             <Skeleton className="h-14 w-[50%]" />
//             <Skeleton className="h-4 w-[80%]" />
//             <Skeleton className="h-4 w-[45%]" />
//             <Skeleton className="h-4 w-[60%]" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!doc) {
//     return <div>Document not found</div>;
//   }

//   return (
//     <div className="pb-40">
//       <Cover url={doc.coverImage} />
//       <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
//         {/* <Toolbar initialData={doc} /> */}
//         {/* <Editor onChange={handleChange} initialContent={doc?.content} /> */}
//       </div>
//     </div>
//   );
// };

// export default DocumentsPage;
