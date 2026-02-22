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

  static async create(
    environmentId: string,
    data: {
      nombre: string;
      contacto?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
    },
    actorId: string
  ) {
    const provider = await prisma.provider.create({
      data: {
        environmentId,
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PROVIDER_CREATED',
        targetType: 'Provider',
        targetId: provider.id,
        newValue: provider
      }
    });

    return provider;
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
    },
    actorId: string
  ) {
    const existing = await prisma.provider.findFirst({
      where: { id, environmentId }
    });

    if (!existing) {
      throw new Error('Proveedor no encontrado');
    }

    const provider = await prisma.provider.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PROVIDER_UPDATED',
        targetType: 'Provider',
        targetId: id,
        oldValue: existing,
        newValue: provider
      }
    });

    return provider;
  }

  static async toggle(environmentId: string, id: string, actorId: string) {
    const existing = await prisma.provider.findFirst({
      where: { id, environmentId }
    });

    if (!existing) {
      throw new Error('Proveedor no encontrado');
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: {
        isActive: !existing.isActive
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: provider.isActive ? 'PROVIDER_ENABLED' : 'PROVIDER_DISABLED',
        targetType: 'Provider',
        targetId: id,
        oldValue: { isActive: existing.isActive },
        newValue: { isActive: provider.isActive }
      }
    });

    return provider;
  }

}
