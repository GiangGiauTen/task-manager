// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useGetSidebarParentNote } from '../api/use-get-sidebar-parent-note';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useState } from 'react';
// import Item from './item';
// import { cn } from '@/lib/utils';
// import { FileIcon } from 'lucide-react';
// import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
// // import { useTrigger } from '@/hooks/use-trigger';

// type Props = {
//   parentDocumentId?: string;
//   level?: number;
//   data?: any;
// };

// const NoteList = ({ parentDocumentId, level = 0 }: Props) => {
//   const params = useParams();
//   const router = useRouter();
//   // const trigger = useTrigger();
//   const workspaceId = useWorkspaceId();
//   const [expanded, setExpanded] = useState<Record<string, boolean>>({});

//   const {
//     data: doc,
//     isLoading,
//     error,
//   } = useGetSidebarParentNote({ parentDocumentId });

//   const onExpand = (noteId: string) => {
//     setExpanded(prevExpanded => ({
//       ...prevExpanded,
//       [noteId]: !prevExpanded[noteId],
//     }));
//   };
//   const onRedirect = (noteId: string) => {
//     router.push(`/workspaces/${workspaceId}/notes/${noteId}`);
//   };
//   if (isLoading) {
//     return (
//       <>
//         <Item.Skeleton level={level} />
//         {level === 0 && (
//           <>
//             <Item.Skeleton level={level} />
//             <Item.Skeleton level={level} />
//           </>
//         )}
//       </>
//     );
//   }

//   if (error) {
//     console.error(error);
//     return null;
//   }

//   return (
//     <>
//       <div
//         style={{ paddingLeft: level ? `${level * 12 + 12}px` : '12px' }}
//         className={cn(
//           'hidden text-sm px-3 font-medium text-muted-foreground/80',
//           expanded && 'last:block',
//           level === 0 && 'hidden',
//         )}>
//         No pages found 🙂
//       </div>

//       {doc?.map((document: any) => (
//         <div key={document.$id}>
//           <Item
//             noteId={document.$id}
//             onClick={() => onRedirect(document.$id)}
//             label={document.title}
//             icon={FileIcon}
//             documentIcon={document.icon}
//             active={params.noteId === document.$id}
//             level={level}
//             onExpand={() => onExpand(document.$id)}
//             expanded={expanded[document.$id]}
//           />

//           {expanded[document.$id] && (
//             <NoteList parentDocumentId={document.$id} level={level + 1} />
//           )}
//         </div>
//       ))}
//     </>
//   );
// };

// export default NoteList;
