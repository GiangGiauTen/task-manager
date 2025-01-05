import { useState, useEffect } from 'react';
import {
  PencilIcon,
  XIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
} from 'lucide-react';
import { Task } from '../types';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { useUpdateTask } from '../api/use-update-task';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Heading } from '@tiptap/extension-heading'; // Extension cho Header
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskDescriptionProps {
  task: Task;
}

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null; // Nếu editor chưa được khởi tạo, không hiển thị toolbar

  return (
    <div className="flex gap-2 mb-4">
      {/* Bold */}
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().toggleBold().run()}
        variant="ghost">
        <BoldIcon className="w-5 h-5" />
      </Button>

      {/* Italic */}
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().toggleItalic().run()}
        variant="ghost">
        <ItalicIcon className="w-5 h-5" />
      </Button>

      {/* Underline */}
      <Button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setMark('textStyle', { textDecoration: 'underline' })
            .run()
        }
        disabled={
          !editor
            .can()
            .chain()
            .setMark('textStyle', { textDecoration: 'underline' })
            .run()
        }
        variant="ghost">
        <UnderlineIcon className="w-5 h-5" />
      </Button>

      {/* Align Left */}
      <Button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        disabled={!editor.can().chain().setTextAlign('left').run()}
        variant="ghost">
        <AlignLeftIcon className="w-5 h-5" />
      </Button>

      {/* Align Center */}
      <Button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        disabled={!editor.can().chain().setTextAlign('center').run()}
        variant="ghost">
        <AlignCenterIcon className="w-5 h-5" />
      </Button>

      {/* Align Right */}
      <Button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        disabled={!editor.can().chain().setTextAlign('right').run()}
        variant="ghost">
        <AlignRightIcon className="w-5 h-5" />
      </Button>

      {/* Header Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Heading1Icon className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            disabled={!editor.can().chain().toggleHeading({ level: 1 }).run()}>
            <Heading1Icon className="w-5 h-5 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={!editor.can().chain().toggleHeading({ level: 2 }).run()}>
            <Heading2Icon className="w-5 h-5 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={!editor.can().chain().toggleHeading({ level: 3 }).run()}>
            <Heading3Icon className="w-5 h-5 mr-2" />
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bullet List */}
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().toggleBulletList().run()}
        variant="ghost">
        <ListIcon className="w-5 h-5" />
      </Button>

      {/* Ordered List */}
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().toggleOrderedList().run()}
        variant="ghost">
        <ListOrderedIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdateTask();

  // Initialize Tiptap editor with necessary extensions
  const editor = useEditor({
    extensions: [
      StarterKit, // Basic formatting (bold, italic, underline, etc.)
      TextStyle, // For underline and text styling
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }), // For text alignment
      Heading.configure({ levels: [1, 2, 3] }), // For header (H1, H2, H3)
    ],
    content: task.description || '', // Load initial task description
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(task.description || '');
    }
  }, [task.description, editor]);

  const handleSave = () => {
    mutate(
      {
        json: { description: editor?.getHTML() }, // Lưu HTML của mô tả
        param: { taskId: task.$id },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          onClick={() => setIsEditing(prev => !prev)}
          size={'sm'}
          variant={'secondary'}>
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      <DottedSeparator classname="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          {/* Toolbar for formatting options */}
          <Toolbar editor={editor} />
          <div className="border p-2">
            {/* Tiptap editor content */}
            <EditorContent editor={editor} />
          </div>
          <Button
            size="sm"
            className="w-fit ml-auto"
            onClick={handleSave}
            disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: task.description || '<span>No description set</span>',
          }}
        />
      )}
    </div>
  );
};
