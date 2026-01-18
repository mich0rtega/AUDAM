import { authenticate } from './auth.middleware';
import { setEnvironment } from './environment.middleware';
import { authorize } from './role.middleware';
import { Role } from '@prisma/client';

export function businessRoute(roles: Role[]) {
  return [
    authenticate,
    setEnvironment,
    authorize(roles)
  ];
}
