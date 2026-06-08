import axios from 'axios';
import { generateTestNote, generateTestUser, mockAxiosInstance } from '../../../test-helpers';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  let apiService: any;
  let mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the API service
    apiService = {
      // Auth endpoints
      register: async (email: string, password: string) => {
        const response = await mockedAxios.post('/auth/register', { email, password });
        return response.data;
      },

      login: async (email: string, password: string) => {
        const response = await mockedAxios.post('/auth/login', { email, password });
        return response.data;
      },

      logout: async () => {
        const response = await mockedAxios.post('/auth/logout');
        return response.data;
      },

      // Note endpoints
      createNote: async (title: string, content: string) => {
        const response = await mockedAxios.post('/notes', { title, content });
        return response.data;
      },

      getNotes: async () => {
        const response = await mockedAxios.get('/notes');
        return response.data;
      },

      getNoteById: async (id: string) => {
        const response = await mockedAxios.get(`/notes/${id}`);
        return response.data;
      },

      updateNote: async (id: string, updates: any) => {
        const response = await mockedAxios.put(`/notes/${id}`, updates);
        return response.data;
      },

      deleteNote: async (id: string) => {
        const response = await mockedAxios.delete(`/notes/${id}`);
        return response.data;
      },

      toggleFavorite: async (id: string) => {
        const response = await mockedAxios.patch(`/notes/${id}/favorite`);
        return response.data;
      },

      // File endpoints
      uploadFile: async (file: File, noteId: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('noteId', noteId);
        const response = await mockedAxios.post('/files/upload', formData);
        return response.data;
      },

      getPresignedUrl: async (fileKey: string) => {
        const response = await mockedAxios.get(`/files/presigned-url?key=${fileKey}`);
        return response.data;
      },
    };

    // Mock axios.post
    mockedAxios.post.mockResolvedValue({ data: {} });
    // Mock axios.get
    mockedAxios.get.mockResolvedValue({ data: {} });
    // Mock axios.put
    mockedAxios.put.mockResolvedValue({ data: {} });
    // Mock axios.delete
    mockedAxios.delete.mockResolvedValue({ data: {} });
    // Mock axios.patch
    mockedAxios.patch.mockResolvedValue({ data: {} });
  });

  describe('Authentication', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        const testUser = generateTestUser();
        const responseData = { user: testUser, accessToken: 'test-token' };

        mockedAxios.post.mockResolvedValueOnce({ data: responseData });

        const result = await apiService.register(testUser.email, testUser.email);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', {
          email: testUser.email,
          password: testUser.email,
        });
        expect(result).toEqual(responseData);
      });

      it('should handle registration errors', async () => {
        const error = new Error('Email already exists');
        mockedAxios.post.mockRejectedValueOnce(error);

        await expect(apiService.register('test@example.com', 'password')).rejects.toThrow(
          'Email already exists'
        );
      });
    });

    describe('login', () => {
      it('should login user with valid credentials', async () => {
        const testUser = generateTestUser();
        const responseData = { user: testUser, accessToken: 'test-token' };

        mockedAxios.post.mockResolvedValueOnce({ data: responseData });

        const result = await apiService.login(testUser.email, 'password');

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
          email: testUser.email,
          password: 'password',
        });
        expect(result).toEqual(responseData);
      });

      it('should handle login errors', async () => {
        const error = new Error('Invalid credentials');
        mockedAxios.post.mockRejectedValueOnce(error);

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow(
          'Invalid credentials'
        );
      });
    });

    describe('logout', () => {
      it('should logout user', async () => {
        const responseData = { message: 'Logged out' };
        mockedAxios.post.mockResolvedValueOnce({ data: responseData });

        const result = await apiService.logout();

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
        expect(result).toEqual(responseData);
      });
    });
  });

  describe('Notes', () => {
    describe('createNote', () => {
      it('should create a new note', async () => {
        const testNote = generateTestNote();
        mockedAxios.post.mockResolvedValueOnce({ data: testNote });

        const result = await apiService.createNote(testNote.title, testNote.content);

        expect(mockedAxios.post).toHaveBeenCalledWith('/notes', {
          title: testNote.title,
          content: testNote.content,
        });
        expect(result).toEqual(testNote);
      });
    });

    describe('getNotes', () => {
      it('should fetch all notes', async () => {
        const notes = [generateTestNote(), generateTestNote({ title: 'Note 2' })];
        mockedAxios.get.mockResolvedValueOnce({ data: { notes } });

        const result = await apiService.getNotes();

        expect(mockedAxios.get).toHaveBeenCalledWith('/notes');
        expect(result).toEqual({ notes });
      });

      it('should return empty array if no notes', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { notes: [] } });

        const result = await apiService.getNotes();

        expect(result).toEqual({ notes: [] });
      });
    });

    describe('getNoteById', () => {
      it('should fetch a specific note', async () => {
        const testNote = generateTestNote();
        mockedAxios.get.mockResolvedValueOnce({ data: testNote });

        const result = await apiService.getNoteById(testNote.id);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/notes/${testNote.id}`);
        expect(result).toEqual(testNote);
      });
    });

    describe('updateNote', () => {
      it('should update a note', async () => {
        const testNote = generateTestNote();
        const updates = { title: 'Updated Title' };
        const updated = { ...testNote, ...updates };

        mockedAxios.put.mockResolvedValueOnce({ data: updated });

        const result = await apiService.updateNote(testNote.id, updates);

        expect(mockedAxios.put).toHaveBeenCalledWith(`/notes/${testNote.id}`, updates);
        expect(result).toEqual(updated);
      });
    });

    describe('deleteNote', () => {
      it('should delete a note', async () => {
        const noteId = 'test-note-id';
        mockedAxios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

        const result = await apiService.deleteNote(noteId);

        expect(mockedAxios.delete).toHaveBeenCalledWith(`/notes/${noteId}`);
      });
    });

    describe('toggleFavorite', () => {
      it('should toggle note favorite status', async () => {
        const testNote = generateTestNote({ isFavorite: false });
        const updated = { ...testNote, isFavorite: true };

        mockedAxios.patch.mockResolvedValueOnce({ data: updated });

        const result = await apiService.toggleFavorite(testNote.id);

        expect(mockedAxios.patch).toHaveBeenCalledWith(`/notes/${testNote.id}/favorite`);
        expect(result.isFavorite).toBe(true);
      });
    });
  });

  describe('Files', () => {
    describe('uploadFile', () => {
      it('should upload a file', async () => {
        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        const noteId = 'test-note-id';
        const responseData = { fileKey: 'test-file-key', url: 'https://...' };

        mockedAxios.post.mockResolvedValueOnce({ data: responseData });

        const result = await apiService.uploadFile(file, noteId);

        expect(mockedAxios.post).toHaveBeenCalled();
        expect(result).toEqual(responseData);
      });
    });

    describe('getPresignedUrl', () => {
      it('should get presigned URL for file', async () => {
        const fileKey = 'test-file-key';
        const responseData = { url: 'https://presigned-url' };

        mockedAxios.get.mockResolvedValueOnce({ data: responseData });

        const result = await apiService.getPresignedUrl(fileKey);

        expect(mockedAxios.get).toHaveBeenCalledWith(`/files/presigned-url?key=${fileKey}`);
        expect(result).toEqual(responseData);
      });
    });
  });
});
