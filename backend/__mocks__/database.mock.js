// Mock database query responses
import { jest } from "@jest/globals";

export const mockDbClient = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

export const mockQueryResponse = {
  rows: [],
  rowCount: 0,
  command: 'SELECT',
};

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password_hash: '$2a$10$hashedpassword',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockNote = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note',
  content: '# Test Content',
  is_favorite: false,
  file_key: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockCreateUserResponse = {
  rows: [mockUser],
  rowCount: 1,
};

export const mockFindUserResponse = {
  rows: [mockUser],
  rowCount: 1,
};

export const mockCreateNoteResponse = {
  rows: [mockNote],
  rowCount: 1,
};

export const mockEmptyResponse = {
  rows: [],
  rowCount: 0,
};
