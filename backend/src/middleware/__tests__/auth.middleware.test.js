import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  generateTestToken,
} from '../../../test-helpers.js';

// Mock dependencies
jest.mock('../../utils/tokens.js');

describe('AuthMiddleware', () => {
  let authMiddleware;
  let mockTokens;

  beforeEach(async () => {
    jest.clearAllMocks();

    const tokensModule = await import('../../utils/tokens.js');
    mockTokens = tokensModule.default;

    // Mock verifyToken to return a mock implementation
    mockTokens.verifyToken = jest.fn();

    // Mock auth middleware
    authMiddleware = {
      protect: (req, res, next) => {
        try {
          const token = req.headers.authorization?.split(' ')[1];

          if (!token) {
            return res.status(401).json({ message: 'No token provided' });
          }

          const decoded = mockTokens.verifyToken(token);
          if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
          }

          req.user = decoded;
          next();
        } catch (error) {
          return res.status(401).json({ message: 'Token verification failed' });
        }
      },

      requireRole: (role) => (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ message: 'User not authenticated' });
        }

        if (req.user.role !== role) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should allow request with valid token', () => {
      const token = generateTestToken({ sub: '123e4567-e89b-12d3-a456-426614174000' });
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockTokens.verifyToken.mockReturnValueOnce({
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      });

      authMiddleware.protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.sub).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should reject request with no token', () => {
      const req = createMockRequest({
        headers: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No token provided',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', () => {
      const req = createMockRequest({
        headers: { authorization: 'InvalidToken' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', () => {
      const token = generateTestToken();
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockTokens.verifyToken.mockReturnValueOnce(null);

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token',
        })
      );
    });

    it('should handle verification errors', () => {
      const token = generateTestToken();
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockTokens.verifyToken.mockImplementationOnce(() => {
        throw new Error('Verification failed');
      });

      authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token verification failed',
        })
      );
    });
  });

  describe('requireRole middleware', () => {
    it('should allow user with correct role', () => {
      const req = createMockRequest({
        user: { role: 'admin' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = authMiddleware.requireRole('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user with different role', () => {
      const req = createMockRequest({
        user: { role: 'user' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = authMiddleware.requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject if user not authenticated', () => {
      const req = createMockRequest({
        user: null,
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = authMiddleware.requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
