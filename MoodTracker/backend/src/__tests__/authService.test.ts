import { AuthService } from '../services/authService';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const senha = 'teste123';
      const hash = await AuthService.hashPassword(senha);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(senha);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for same password', async () => {
      const senha = 'teste123';
      const hash1 = await AuthService.hashPassword(senha);
      const hash2 = await AuthService.hashPassword(senha);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const senha = 'teste123';
      const hash = await AuthService.hashPassword(senha);
      const result = await AuthService.comparePassword(senha, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const senha = 'teste123';
      const outroSenha = 'incorreta';
      const hash = await AuthService.hashPassword(senha);
      const result = await AuthService.comparePassword(outroSenha, hash);

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user-123';
      const role = 'user';
      const token = AuthService.generateToken(userId, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should have correct payload after decode', () => {
      const userId = 'user-123';
      const role = 'user';
      const token = AuthService.generateToken(userId, role);
      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = AuthService.generateToken('user-123', 'user');
      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('user-123');
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = AuthService.verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = AuthService.generateToken('user-123', 'user');
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = AuthService.verifyToken(tamperedToken);

      expect(decoded).toBeNull();
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = AuthService.generateId();
      const id2 = AuthService.generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid UUID format', () => {
      const id = AuthService.generateId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(id).toMatch(uuidRegex);
    });
  });
});
