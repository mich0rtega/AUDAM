import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no definido');
}

const signOptions: SignOptions = {
  expiresIn: '15m'
};

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
  };
}
