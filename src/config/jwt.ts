import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no definido');
}


export interface TokenPayload extends JwtPayload {
  userId: string;
  email?: string;
}

const signOptions: SignOptions = {
  expiresIn: '15m'
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, signOptions);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET as string);

  if (typeof decoded === 'string' || !decoded.userId) {
    throw new Error('Token inválido');
  }

  return decoded as TokenPayload;
}
