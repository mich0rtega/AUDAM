import { Role } from '@prisma/client';
import { Environment } from './auth.types';

export const roleEnvironmentAccess: Record<Role, Environment[]> = {
  ADMIN: [Environment.AUDAM, Environment.COMUNIDAD],
  ALMACEN: [Environment.AUDAM, Environment.COMUNIDAD],
  AUTORIZADOR: [Environment.AUDAM, Environment.COMUNIDAD],
  COMPRAS: [Environment.AUDAM, Environment.COMUNIDAD],
  USUARIO: [Environment.AUDAM],
};
