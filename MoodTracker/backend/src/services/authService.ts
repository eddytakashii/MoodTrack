import jwt from 'jwt-simple';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
  static async hashPassword(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
  }

  static async comparePassword(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }

  static generateToken(userId: string, role: string): string {
    const payload = {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 dias
    };
    return jwt.encode(payload, JWT_SECRET);
  }

  static verifyToken(token: string): any {
    try {
      return jwt.decode(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static generateId(): string {
    return randomUUID();
  }
}
