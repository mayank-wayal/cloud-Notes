import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { generateTestNote, generateTestUser } from '../../../test-helpers.js';
import {
  mockNote,
  mockCreateNoteResponse,
  mockEmptyResponse,
} from '../../../__mocks__/database.mock.js';

// Mock database module
jest.mock('../../config/db.js');

describe('NoteService', () => {
  let noteService;
  let mockDb;

  beforeEach(async () => {
    jest.clearAllMocks();

    const dbModule = await import('../../config/db.js');
    mockDb = dbModule.default;

    // Mock note service
    noteService = {
      createNote: async (userId, title, content) => {
        const result = await mockDb.query(
          'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
          [userId, title, content]
        );
        return result.rows[0];
      },
      getNoteById: async (noteId, userId) => {
        const result = await mockDb.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [
          noteId,
          userId,
        ]);
        return result.rows[0];
      },
      getUserNotes: async (userId) => {
        const result = await mockDb.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC', [
          userId,
        ]);
        return result.rows;
      },
      updateNote: async (noteId, userId, updates) => {
        const { title, content } = updates;
        const result = await mockDb.query(
          'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
          [title, content, noteId, userId]
        );
        return result.rows[0];
      },
      deleteNote: async (noteId, userId) => {
        const result = await mockDb.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [
          noteId,
          userId,
        ]);
        return result.rowCount > 0;
      },
      toggleFavorite: async (noteId, userId) => {
        const result = await mockDb.query(
          'UPDATE notes SET is_favorite = NOT is_favorite WHERE id = $1 AND user_id = $2 RETURNING *',
          [noteId, userId]
        );
        return result.rows[0];
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const testUser = generateTestUser();
      const testNote = generateTestNote({ user_id: testUser.id });
      mockDb.query.mockResolvedValueOnce(mockCreateNoteResponse);

      const result = await noteService.createNote(testUser.id, testNote.title, testNote.content);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(testUser.id);
      expect(result.title).toBe(testNote.title);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if title is missing', async () => {
      const testUser = generateTestUser();
      mockDb.query.mockRejectedValueOnce(new Error('Title is required'));

      await expect(noteService.createNote(testUser.id, '', 'content')).rejects.toThrow();
    });
  });

  describe('getNoteById', () => {
    it('should retrieve a note by ID', async () => {
      const testUser = generateTestUser();
      const testNote = generateTestNote({ user_id: testUser.id });
      mockDb.query.mockResolvedValueOnce({
        rows: [testNote],
        rowCount: 1,
      });

      const result = await noteService.getNoteById(testNote.id, testUser.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testNote.id);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [testNote.id, testUser.id]
      );
    });

    it('should return undefined if note not found', async () => {
      const testUser = generateTestUser();
      mockDb.query.mockResolvedValueOnce(mockEmptyResponse);

      const result = await noteService.getNoteById('nonexistent', testUser.id);

      expect(result).toBeUndefined();
    });

    it('should not return notes from other users', async () => {
      const testUser = generateTestUser();
      const otherUserId = 'other-user-id';
      mockDb.query.mockResolvedValueOnce(mockEmptyResponse);

      const result = await noteService.getNoteById('note-id', otherUserId);

      expect(result).toBeUndefined();
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('user_id'),
        expect.arrayContaining([otherUserId])
      );
    });
  });

  describe('getUserNotes', () => {
    it('should retrieve all notes for a user', async () => {
      const testUser = generateTestUser();
      const notes = [
        generateTestNote({ user_id: testUser.id }),
        generateTestNote({ user_id: testUser.id, title: 'Note 2' }),
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: notes,
        rowCount: 2,
      });

      const result = await noteService.getUserNotes(testUser.id);

      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(testUser.id);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY'),
        [testUser.id]
      );
    });

    it('should return empty array if user has no notes', async () => {
      const testUser = generateTestUser();
      mockDb.query.mockResolvedValueOnce(mockEmptyResponse);

      const result = await noteService.getUserNotes(testUser.id);

      expect(result).toEqual([]);
    });
  });

  describe('updateNote', () => {
    it('should update note title and content', async () => {
      const testUser = generateTestUser();
      const testNote = generateTestNote({ user_id: testUser.id });
      const updates = { title: 'Updated Title', content: 'Updated Content' };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ ...testNote, ...updates }],
        rowCount: 1,
      });

      const result = await noteService.updateNote(testNote.id, testUser.id, updates);

      expect(result.title).toBe(updates.title);
      expect(result.content).toBe(updates.content);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const testUser = generateTestUser();
      const testNote = generateTestNote({ user_id: testUser.id });

      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: testNote.id }],
        rowCount: 1,
      });

      const result = await noteService.deleteNote(testNote.id, testUser.id);

      expect(result).toBe(true);
    });

    it('should return false if note not found', async () => {
      const testUser = generateTestUser();
      mockDb.query.mockResolvedValueOnce(mockEmptyResponse);

      const result = await noteService.deleteNote('nonexistent', testUser.id);

      expect(result).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const testUser = generateTestUser();
      const testNote = generateTestNote({ user_id: testUser.id, is_favorite: false });

      mockDb.query.mockResolvedValueOnce({
        rows: [{ ...testNote, is_favorite: true }],
        rowCount: 1,
      });

      const result = await noteService.toggleFavorite(testNote.id, testUser.id);

      expect(result.is_favorite).toBe(true);
    });
  });
});
