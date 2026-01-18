import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido');

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  tokenVersion: number;
}

const accessOptions: SignOptions = {
  expiresIn: '15m' 
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, accessOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string' || !decoded.userId) {
    throw new Error('Token inválido');
  }

  return decoded as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}
