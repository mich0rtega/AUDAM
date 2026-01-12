import { Environment, Role } from '../auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: Role;
      };
      environment?: Environment;
    }
  }
}

export {};
