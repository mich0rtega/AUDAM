import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: '1d',
};