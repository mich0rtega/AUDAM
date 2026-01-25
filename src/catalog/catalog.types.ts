import { MovementDirection } from '@prisma/client';

export interface CreateProductTypeDto {
  name: string;
  description?: string;
}

export interface CreateMovementTypeDto {
  name: string;
  direction: MovementDirection;
}

export interface CreateProviderDto {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}
