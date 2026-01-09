import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET as string,
};

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el .env');
}
