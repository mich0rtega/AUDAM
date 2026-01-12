import type { SignOptions, Secret } from 'jsonwebtoken';
import { env } from './env';

export const jwtConfig: {
  secret: Secret;
  expiresIn: SignOptions['expiresIn'];
} = {
  secret: env.JWT_SECRET,
  expiresIn: '15m',
};
