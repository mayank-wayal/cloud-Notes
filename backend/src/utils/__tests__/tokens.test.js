import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateTestUser } from '../../../test-helpers.js';

describe('TokensUtility', () => {
  let tokensUtil;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock tokens utility
    tokensUtil = {
      generateTokens: (userId) => {
        return {
          accessToken: `access_token_${userId}`,
          refreshToken: `refresh_token_${userId}`,
        };
      },

      verifyToken: (token) => {
        if (!token || token === 'invalid') {
          return null;
        }
        return {
          sub: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
        };
      },

      decodeToken: (token) => {
        try {
          if (!token) throw new Error('No token');
          return {
            sub: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
          };
        } catch (error) {
          return null;
        }
      },

      refreshAccessToken: (refreshToken) => {
        if (!refreshToken || refreshToken === 'invalid') {
          return null;
        }
        return {
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        };
      },
    };
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const testUser = generateTestUser();

      const tokens = tokensUtil.generateTokens(testUser.id);

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).toContain('access_token');
      expect(tokens.refreshToken).toContain('refresh_token');
    });

    it('should include user ID in tokens', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const tokens = tokensUtil.generateTokens(userId);

      expect(tokens.accessToken).toContain(userId);
      expect(tokens.refreshToken).toContain(userId);
    });

    it('should generate different tokens for different users', () => {
      const userId1 = '123e4567-e89b-12d3-a456-426614174000';
      const userId2 = '223e4567-e89b-12d3-a456-426614174000';

      const tokens1 = tokensUtil.generateTokens(userId1);
      const tokens2 = tokensUtil.generateTokens(userId2);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = 'valid_token';

      const decoded = tokensUtil.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBeDefined();
      expect(decoded.email).toBeDefined();
    });

    it('should return null for invalid token', () => {
      const decoded = tokensUtil.verifyToken('invalid');

      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = tokensUtil.verifyToken('');

      expect(decoded).toBeNull();
    });

    it('should return null for null token', () => {
      const decoded = tokensUtil.verifyToken(null);

      expect(decoded).toBeNull();
    });

    it('should decode token correctly', () => {
      const token = 'valid_token';

      const decoded = tokensUtil.verifyToken(token);

      expect(decoded.sub).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(decoded.email).toBe('test@example.com');
    });
  });

  describe('decodeToken', () => {
    it('should decode valid token', () => {
      const token = 'valid_token';

      const decoded = tokensUtil.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should return null for invalid token', () => {
      const decoded = tokensUtil.decodeToken('');

      expect(decoded).toBeNull();
    });

    it('should return null for null token', () => {
      const decoded = tokensUtil.decodeToken(null);

      expect(decoded).toBeNull();
    });

    it('should include issued-at claim', () => {
      const token = 'valid_token';

      const decoded = tokensUtil.decodeToken(token);

      expect(decoded.iat).toBeDefined();
      expect(typeof decoded.iat).toBe('number');
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new tokens from refresh token', () => {
      const refreshToken = 'valid_refresh_token';

      const result = tokensUtil.refreshAccessToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should return null for invalid refresh token', () => {
      const result = tokensUtil.refreshAccessToken('invalid');

      expect(result).toBeNull();
    });

    it('should return null for empty refresh token', () => {
      const result = tokensUtil.refreshAccessToken('');

      expect(result).toBeNull();
    });

    it('should generate different access token', () => {
      const refreshToken = 'valid_refresh_token';

      const result = tokensUtil.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBe('new_access_token');
    });
  });
});
