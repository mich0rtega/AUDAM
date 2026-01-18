import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      context?: {
        environmentId: string;
        role: Role;
      };
    }
  }
}

export {};
