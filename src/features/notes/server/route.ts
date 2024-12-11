import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createNoteSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import { DATABASE_ID, NOTES_ID, WORKSPACES_ID, MEMBERS_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { createAdminClient } from '@/lib/appwrite';
import { Note } from '@/features/notes/types';
const app = new Hono()
  .get(
    '/sidebarParent',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        parentDocument: z.string().optional(),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { parentDocument } = c.req.valid('query');

      try {
        if (!user) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        const query = [
          Query.equal('userId', user.$id),
          Query.equal('isArchived', false),
          Query.orderAsc('$createdAt'),
        ];

        if (parentDocument) {
          query.push(Query.equal('parentDocument', parentDocument));
        } else {
          query.push(Query.isNull('parentDocument'));
        }

        console.log('Query:', query);

        const documents = await databases.listDocuments(
          DATABASE_ID,
          NOTES_ID,
          query,
        );

        if (!documents || documents.documents.length === 0) {
          return c.json({ data: [] });
        }

        return c.json({ data: documents.documents });
      } catch (error) {
        console.error('Error fetching sidebarParent notes:', error);
        return c.json({ error: 'Failed to fetch documents' }, 500);
      }
    },
  )

  .post(
    '/',
    sessionMiddleware,
    zValidator('json', createNoteSchema),
    async c => {
      const user = c.get('user');
      const databases = c.get('databases');
      const {
        title,
        content,
        workspaceId,
        projectId,
        coverImage,
        coverImageId,
        isArchived,
        isPublished,
        parentDocument,
        icon,
      } = c.req.valid('json');

      // Verify the user is a member of the workspace
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const newNote = await databases.createDocument(
        DATABASE_ID,
        NOTES_ID,
        ID.unique(),
        {
          userId: user.$id,
          title,
          content,
          workspaceId,
          projectId,
          coverImage,
          coverImageId,
          isArchived: isArchived || false,
          isPublished: isPublished || false,
          parentDocument,
          icon,
        },
      );

      return c.json({ data: newNote });
    },
  )

  // Get all notes for a workspace
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string().min(1, 'Workspace ID is required'),
        projectId: z.string().nullish(),
        parentDocument: z.string().nullish(),
        isArchived: z.boolean().optional(),
        isPublished: z.boolean().optional(),
      }),
    ),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const {
        workspaceId,
        projectId,
        parentDocument,
        isArchived,
        isPublished,
      } = c.req.valid('query');

      // Verify the user is a member of the workspace
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const query = [
        Query.equal('workspaceId', workspaceId),
        Query.equal('userId', user.$id),
        Query.orderAsc('$createdAt'),
      ];

      if (projectId) {
        query.push(Query.equal('projectId', projectId));
      }

      if (parentDocument) {
        query.push(Query.equal('parentDocument', parentDocument));
      } else {
        query.push(Query.isNull('parentDocument'));
      }
      if (typeof isArchived === 'boolean') {
        query.push(Query.equal('isArchived', isArchived));
      }
      if (typeof isPublished === 'boolean') {
        query.push(Query.equal('isPublished', isPublished));
      }
      const notes = await databases.listDocuments(DATABASE_ID, NOTES_ID, query);

      return c.json({ data: notes.documents });
    },
  )

  // Get a specific note by ID
  .get('/:noteId', sessionMiddleware, async c => {
    const currentUser = c.get('user');
    const databases = c.get('databases');
    const { users } = await createAdminClient();
    const { noteId } = c.req.param();

    // Lấy ghi chú từ cơ sở dữ liệu
    const note = await databases.getDocument<Note>(
      DATABASE_ID,
      NOTES_ID,
      noteId,
    );

    // Kiểm tra quyền truy cập của người dùng
    const currentMember = await getMember({
      databases,
      workspaceId: note.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Lấy thông tin workspace liên quan đến note
    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      note.workspaceId,
    );

    // Lấy thông tin người dùng từ bảng members
    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      note.userId,
    );

    // Lấy thông tin từ bảng users
    const user = await users.get(member.userId);

    const creator = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: {
        ...note,
        workspace,
        creator,
      },
    });
  })
  // Update a note
  .patch(
    '/:noteId',
    sessionMiddleware,
    zValidator('json', createNoteSchema.partial()),
    async c => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { noteId } = c.req.param();
      const updateData = c.req.valid('json');

      const note = await databases.getDocument(DATABASE_ID, NOTES_ID, noteId);

      if (!note || note.userId !== user.$id) {
        return c.json({ error: 'Unauthorized or not found' }, 404);
      }

      const updatedNote = await databases.updateDocument(
        DATABASE_ID,
        NOTES_ID,
        noteId,
        updateData,
      );

      return c.json({ data: updatedNote });
    },
  )

  // Delete a note
  .delete('/:noteId', sessionMiddleware, async c => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { noteId } = c.req.param();

    const note = await databases.getDocument(DATABASE_ID, NOTES_ID, noteId);

    if (!note || note.userId !== user.$id) {
      return c.json({ error: 'Unauthorized or not found' }, 404);
    }

    await databases.deleteDocument(DATABASE_ID, NOTES_ID, noteId);

    return c.json({ message: 'Note deleted successfully' });
  })
  .patch('/:noteId/archive', sessionMiddleware, async c => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { noteId } = c.req.param();

    // Fetch the note to be archived
    const note = await databases.getDocument(DATABASE_ID, NOTES_ID, noteId);

    if (!note || note.userId !== user.$id) {
      return c.json({ error: 'Unauthorized or not found' }, 404);
    }

    // Archive the parent note
    await databases.updateDocument(DATABASE_ID, NOTES_ID, noteId, {
      isArchived: true,
    });

    // Find and archive all child documents
    const childNotes = await databases.listDocuments(DATABASE_ID, NOTES_ID, [
      Query.equal('parentDocument', noteId),
      Query.equal('userId', user.$id),
    ]);

    for (const childNote of childNotes.documents) {
      await databases.updateDocument(DATABASE_ID, NOTES_ID, childNote.$id, {
        isArchived: true,
      });
    }

    return c.json({
      message: 'Note and its child notes archived successfully',
    });
  })
  .patch('/:noteId/restore', sessionMiddleware, async c => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { noteId } = c.req.param();

    const note = await databases.getDocument(DATABASE_ID, NOTES_ID, noteId);

    if (!note || note.userId !== user.$id) {
      return c.json({ error: 'Unauthorized or not found' }, 404);
    }

    // Nếu ghi chú có parentDocument, kiểm tra trạng thái của cha
    if (note.parentDocument) {
      const parent = await databases.getDocument(
        DATABASE_ID,
        NOTES_ID,
        note.parentDocument,
      );

      if (parent?.isArchived) {
        await databases.updateDocument(DATABASE_ID, NOTES_ID, noteId, {
          parentDocument: null, // Bỏ liên kết với cha đã lưu trữ
        });
      }
    }

    // Cập nhật trạng thái của ghi chú hiện tại
    await databases.updateDocument(DATABASE_ID, NOTES_ID, noteId, {
      isArchived: false,
    });

    // Hàm đệ quy để phục hồi tất cả các ghi chú con
    const recursiveRestore = async (docId: string) => {
      const children = await databases.listDocuments(DATABASE_ID, NOTES_ID, [
        Query.equal('parentDocument', docId),
        Query.equal('userId', user.$id),
      ]);

      for (const child of children.documents) {
        await databases.updateDocument(DATABASE_ID, NOTES_ID, child.$id, {
          isArchived: false,
        });
        await recursiveRestore(child.$id);
      }
    };

    // Gọi hàm đệ quy để phục hồi các ghi chú con
    await recursiveRestore(noteId);

    return c.json({
      message: 'Note and its child notes restored successfully',
    });
  })
  .get('/trash', sessionMiddleware, async c => {
    const databases = c.get('databases');
    const user = c.get('user');

    // Get all notes that are archived
    const archivedNotes = await databases.listDocuments(DATABASE_ID, NOTES_ID, [
      Query.equal('userId', user.$id),
      Query.equal('isArchived', true),
      Query.orderAsc('$createdAt'),
    ]);

    return c.json({ data: archivedNotes.documents });
  });
export default app;
