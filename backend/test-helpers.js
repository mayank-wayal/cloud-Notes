// Test helpers and utilities

/**
 * Create a mock Express request object
 */
export const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    file: null,
    files: [],
    ...overrides,
  };
};

/**
 * Create a mock Express response object
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
};

/**
 * Create a mock Express next function
 */
export const createMockNext = () => {
  return jest.fn();
};

/**
 * Generate a test JWT token
 */
export const generateTestToken = (payload = {}, expiresIn = '1h') => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(
    JSON.stringify({
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      ...payload,
    })
  ).toString('base64');
  const signature = Buffer.from('test-signature').toString('base64');
  return `${header}.${body}.${signature}`;
};

/**
 * Generate test user credentials
 */
export const generateTestUser = (overrides = {}) => {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'TestPassword123!',
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate test note
 */
export const generateTestNote = (overrides = {}) => {
  return {
    id: '223e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Note',
    content: '# Test Content',
    is_favorite: false,
    file_key: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};
