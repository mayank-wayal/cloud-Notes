import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { PropsWithChildren } from 'react';

// Mock providers wrapper
const AllTheProviders = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data generators
export const generateTestUser = (overrides = {}) => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
};

export const generateTestNote = (overrides = {}) => {
  return {
    id: 'test-note-id',
    userId: 'test-user-id',
    title: 'Test Note',
    content: '# Test Content',
    isFavorite: false,
    fileKey: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

// Mock axios instance
export const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

// Mock localStorage
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

// Mock fetch
export const createMockFetch = () => {
  return jest.fn((url: string, options?: any) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob(),
    });
  });
};

// Mock Cognito
export const mockCognitoAuth = {
  signUp: jest.fn(() =>
    Promise.resolve({
      userId: 'test-user-id',
      codeDeliveryDetails: {
        Destination: 'test@example.com',
        DeliveryMedium: 'EMAIL',
      },
    })
  ),
  signIn: jest.fn(() =>
    Promise.resolve({
      accessToken: {
        jwtToken: 'test-jwt-token',
      },
      idToken: {
        jwtToken: 'test-id-token',
      },
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  confirmSignUp: jest.fn(() => Promise.resolve()),
  forgotPassword: jest.fn(() => Promise.resolve()),
  confirmForgotPassword: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() =>
    Promise.resolve({
      username: 'testuser',
      attributes: {
        email: 'test@example.com',
      },
    })
  ),
  fetchUserAttributes: jest.fn(() =>
    Promise.resolve({
      email: 'test@example.com',
      email_verified: true,
    })
  ),
};
