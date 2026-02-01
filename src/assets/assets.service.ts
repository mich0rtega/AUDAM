import { prisma } from '../config/prisma';

export class AssetsService {

  static list(environmentId: string) {
    return prisma.asset.findMany({
      where: { environmentId },
      include: {
        category: true,
        status: true,
        responsable: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(
    environmentId: string,
    dto: any,
    actorId: string
  ) {
    const asset = await prisma.asset.create({
      data: {
        environmentId,
        categoryId: dto.categoryId,
        statusId: dto.statusId,
        responsableId: dto.responsableId,
        marca: dto.marca,
        modelo: dto.modelo,
        numeroSerie: dto.numeroSerie,
        ubicacion: dto.ubicacion,
        imagenUrl: dto.imagenUrl,
        stockActual: typeof dto.stockActual === 'number' ? dto.stockActual : null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ASSET_CREATED',
        targetType: 'Asset',
        targetId: asset.id
      }
    });

    return asset;
  }

  static async update(
    environmentId: string,
    id: string,
    dto: any,
    actorId: string
  ) {
    const asset = await prisma.asset.findFirst({ where: { id, environmentId } });
    if (!asset) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        categoryId: dto.categoryId ?? asset.categoryId,
        statusId: dto.statusId ?? asset.statusId,
        responsableId: dto.responsableId ?? asset.responsableId,
        marca: dto.marca ?? asset.marca,
        modelo: dto.modelo ?? asset.modelo,
        numeroSerie: dto.numeroSerie ?? asset.numeroSerie,
        ubicacion: dto.ubicacion ?? asset.ubicacion,
        imagenUrl: dto.imagenUrl ?? asset.imagenUrl,
        stockActual: typeof dto.stockActual === 'number' ? dto.stockActual : asset.stockActual
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ASSET_UPDATED',
        targetType: 'Asset',
        targetId: id
      }
    });

    return updated;
  }

  static async assign(
    id: string,
    responsableId: string,
    actorId: string
  ) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({
      where: { id },
      data: { responsableId }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ASSET_ASSIGNED',
        targetType: 'Asset',
        targetId: id
      }
    });

    return updated;
  }

  static async changeStatus(
    id: string,
    statusId: string,
    actorId: string
  ) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({
      where: { id },
      data: { statusId }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ASSET_STATUS_CHANGED',
        targetType: 'Asset',
        targetId: id
      }
    });

    return updated;
  }

}
