import { Role } from '@prisma/client';

export interface UserEnvironmentDTO {
  id: string;
  email: string;
  role: Role;
}
export interface CreateUserDto {
  email: string;
  password: string;
}

export interface AssignRoleDto {
  userId: string;
  environmentId: string;
  role: 'ADMIN' | 'COMPRAS' | 'ALMACEN' | 'AUTORIZADOR' | 'USUARIO';
}

export interface ChangeRoleDto {
  userEnvironmentId: string;
  role: AssignRoleDto['role'];
}
