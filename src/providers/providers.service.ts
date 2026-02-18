import { prisma } from '../config/prisma';

export class ProvidersService {

  static list(environmentId: string) {
    return prisma.provider.findMany({
      where: { environmentId },
      orderBy: { nombre: 'asc' }
    });
  }

  static async getById(environmentId: string, id: string) {
    const provider = await prisma.provider.findFirst({
      where: { id, environmentId }
    });

    if (!provider) {
      throw new Error('Proveedor no encontrado');
    }

    return provider;
  }

  static create(
    environmentId: string,
    data: {
      nombre: string;
      contacto?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
    }
  ) {
    return prisma.provider.create({
      data: {
        environmentId,
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion
      }
    });
  }

  static async update(
    environmentId: string,
    id: string,
    data: {
      nombre?: string;
      contacto?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.provider.findFirst({
      where: { id, environmentId }
    });

    if (!existing) {
      throw new Error('Proveedor no encontrado');
    }

    return prisma.provider.update({
      where: { id },
      data
    });
  }

  static async toggle(environmentId: string, id: string) {
    const existing = await prisma.provider.findFirst({
      where: { id, environmentId }
    });

    if (!existing) {
      throw new Error('Proveedor no encontrado');
    }

    return prisma.provider.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      }
    });
  }

}
