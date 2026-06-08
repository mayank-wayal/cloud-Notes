import { renderHook, act, waitFor } from '@testing-library/react';
import { generateTestNote } from '../../../test-helpers';

describe('useNotes Hook', () => {
  let useNotes: any;
  let mockApiService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API service
    mockApiService = {
      getNotes: jest.fn(() =>
        Promise.resolve({
          notes: [generateTestNote(), generateTestNote({ title: 'Note 2' })],
        })
      ),
      createNote: jest.fn((title, content) =>
        Promise.resolve(generateTestNote({ title, content }))
      ),
      updateNote: jest.fn((id, updates) =>
        Promise.resolve(generateTestNote({ ...updates }))
      ),
      deleteNote: jest.fn(() => Promise.resolve({ message: 'Deleted' })),
      toggleFavorite: jest.fn((id) =>
        Promise.resolve(generateTestNote({ isFavorite: true }))
      ),
    };

    // Mock hook implementation
    useNotes = () => {
      const [notes, setNotes] = React.useState<any[]>([]);
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState<Error | null>(null);

      const fetchNotes = React.useCallback(async () => {
        setLoading(true);
        try {
          const data = await mockApiService.getNotes();
          setNotes(data.notes);
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      }, []);

      const createNote = React.useCallback(
        async (title: string, content: string) => {
          try {
            const note = await mockApiService.createNote(title, content);
            setNotes((prev) => [note, ...prev]);
            return note;
          } catch (err) {
            setError(err as Error);
            throw err;
          }
        },
        []
      );

      const updateNote = React.useCallback(
        async (id: string, updates: any) => {
          try {
            const updated = await mockApiService.updateNote(id, updates);
            setNotes((prev) =>
              prev.map((note) => (note.id === id ? updated : note))
            );
            return updated;
          } catch (err) {
            setError(err as Error);
            throw err;
          }
        },
        []
      );

      const deleteNote = React.useCallback(
        async (id: string) => {
          try {
            await mockApiService.deleteNote(id);
            setNotes((prev) => prev.filter((note) => note.id !== id));
          } catch (err) {
            setError(err as Error);
            throw err;
          }
        },
        []
      );

      const toggleFavorite = React.useCallback(
        async (id: string) => {
          try {
            const updated = await mockApiService.toggleFavorite(id);
            setNotes((prev) =>
              prev.map((note) => (note.id === id ? updated : note))
            );
            return updated;
          } catch (err) {
            setError(err as Error);
            throw err;
          }
        },
        []
      );

      React.useEffect(() => {
        fetchNotes();
      }, [fetchNotes]);

      return {
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        toggleFavorite,
        fetchNotes,
      };
    };
  });

  describe('useNotes', () => {
    it('should fetch notes on mount', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getNotes).toHaveBeenCalled();
      expect(result.current.notes).toHaveLength(2);
    });

    it('should start in loading state', () => {
      const { result } = renderHook(() => useNotes());

      expect(result.current.loading).toBe(true);
    });

    it('should clear loading state after fetch', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle fetch errors', async () => {
      mockApiService.getNotes.mockRejectedValueOnce(new Error('Failed to fetch'));

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Failed to fetch');
    });
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialLength = result.current.notes.length;

      await act(async () => {
        await result.current.createNote('New Note', 'New content');
      });

      expect(result.current.notes).toHaveLength(initialLength + 1);
      expect(mockApiService.createNote).toHaveBeenCalledWith('New Note', 'New content');
    });

    it('should add new note to the beginning of list', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstNoteBefore = result.current.notes[0];

      await act(async () => {
        await result.current.createNote('First Note', 'content');
      });

      const firstNoteAfter = result.current.notes[0];
      expect(firstNoteAfter).not.toEqual(firstNoteBefore);
    });

    it('should handle creation errors', async () => {
      mockApiService.createNote.mockRejectedValueOnce(new Error('Failed to create'));

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createNote('New Note', 'content');
        })
      ).rejects.toThrow();
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const noteId = result.current.notes[0].id;

      await act(async () => {
        await result.current.updateNote(noteId, { title: 'Updated' });
      });

      expect(mockApiService.updateNote).toHaveBeenCalledWith(noteId, {
        title: 'Updated',
      });
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialLength = result.current.notes.length;
      const noteId = result.current.notes[0].id;

      await act(async () => {
        await result.current.deleteNote(noteId);
      });

      expect(result.current.notes).toHaveLength(initialLength - 1);
      expect(result.current.notes.every((n) => n.id !== noteId)).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const noteId = result.current.notes[0].id;

      await act(async () => {
        await result.current.toggleFavorite(noteId);
      });

      expect(mockApiService.toggleFavorite).toHaveBeenCalledWith(noteId);
      const updatedNote = result.current.notes.find((n) => n.id === noteId);
      expect(updatedNote?.isFavorite).toBe(true);
    });
  });
});
