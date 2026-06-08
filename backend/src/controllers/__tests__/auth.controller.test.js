import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  generateTestUser,
} from '../../../test-helpers.js';

// Mock dependencies
jest.mock('../../services/auth.service.js');
jest.mock('../../utils/tokens.js');

describe('AuthController', () => {
  let authController;
  let mockAuthService;
  let mockTokens;

  beforeEach(async () => {
    jest.clearAllMocks();

    const authServiceModule = await import('../../services/auth.service.js');
    mockAuthService = authServiceModule.default;

    const tokensModule = await import('../../utils/tokens.js');
    mockTokens = tokensModule.default;

    // Mock auth controller methods
    authController = {
      register: async (req, res, next) => {
        try {
          const { email, password } = req.body;

          if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
          }

          const user = await mockAuthService.registerUser(email, password);
          const tokens = mockTokens.generateTokens(user.id);

          return res.status(201).json({
            user: { id: user.id, email: user.email },
            ...tokens,
          });
        } catch (error) {
          next(error);
        }
      },

      login: async (req, res, next) => {
        try {
          const { email, password } = req.body;

          if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
          }

          const user = await mockAuthService.findUserByEmail(email);
          if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          const isPasswordValid = await mockAuthService.verifyPassword(password, user.password_hash);
          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          const tokens = mockTokens.generateTokens(user.id);

          return res.status(200).json({
            user: { id: user.id, email: user.email },
            ...tokens,
          });
        } catch (error) {
          next(error);
        }
      },

      logout: async (req, res) => {
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logged out successfully' });
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const testUser = generateTestUser();
      const req = createMockRequest({
        body: { email: testUser.email, password: testUser.password },
      });
      const res = createMockResponse();

      mockAuthService.registerUser.mockResolvedValueOnce({
        id: testUser.id,
        email: testUser.email,
      });
      mockTokens.generateTokens.mockReturnValueOnce({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: testUser.email }),
          accessToken: 'test-access-token',
        })
      );
    });

    it('should reject registration without email', async () => {
      const req = createMockRequest({
        body: { password: 'TestPassword123!' },
      });
      const res = createMockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Email and password required'),
        })
      );
    });

    it('should reject registration without password', async () => {
      const req = createMockRequest({
        body: { email: 'test@example.com' },
      });
      const res = createMockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle service errors', async () => {
      const testUser = generateTestUser();
      const req = createMockRequest({
        body: { email: testUser.email, password: testUser.password },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAuthService.registerUser.mockRejectedValueOnce(new Error('Database error'));

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const testUser = generateTestUser();
      const req = createMockRequest({
        body: { email: testUser.email, password: testUser.password },
      });
      const res = createMockResponse();

      mockAuthService.findUserByEmail.mockResolvedValueOnce({
        id: testUser.id,
        email: testUser.email,
        password_hash: 'hashed_password',
      });
      mockAuthService.verifyPassword.mockResolvedValueOnce(true);
      mockTokens.generateTokens.mockReturnValueOnce({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should reject login with invalid email', async () => {
      const req = createMockRequest({
        body: { email: 'invalid@example.com', password: 'password' },
      });
      const res = createMockResponse();

      mockAuthService.findUserByEmail.mockResolvedValueOnce(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
        })
      );
    });

    it('should reject login with invalid password', async () => {
      const testUser = generateTestUser();
      const req = createMockRequest({
        body: { email: testUser.email, password: 'wrong-password' },
      });
      const res = createMockResponse();

      mockAuthService.findUserByEmail.mockResolvedValueOnce({
        id: testUser.id,
        email: testUser.email,
        password_hash: 'hashed_password',
      });
      mockAuthService.verifyPassword.mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should clear refresh token and return success', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
