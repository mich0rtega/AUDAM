import { Environment, Role } from './auth.types';

export const roleEnvironmentAccess: Record<Role, Environment[]> = {
  [Role.ADMIN]: [Environment.AUDAM, Environment.COMUNIDAD],
  [Role.ALMACEN]: [Environment.AUDAM, Environment.COMUNIDAD],
  [Role.AUTORIZADOR]: [Environment.AUDAM, Environment.COMUNIDAD],
  [Role.COMPRAS]: [Environment.AUDAM, Environment.COMUNIDAD],
  [Role.USUARIO]: [Environment.AUDAM],
};
