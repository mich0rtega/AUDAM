import { prisma } from '../config/prisma';

export class AssetsService {

  static list(environmentId: string) {
    return prisma.asset.findMany({
      where: { environmentId },
      include: { category: true, status: true, responsable: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(environmentId: string, dto: any, actorId: string) {
    const asset = await prisma.asset.create({
      data: {
        environmentId,
        categoryId: dto.categoryId,
        statusId: dto.statusId,
        responsableId: dto.responsableId || null,
        responsableNombre: dto.responsableNombre || null,
        centroCosto: dto.centroCosto || null,
        marca: dto.marca,
        modelo: dto.modelo || null,
        numeroSerie: dto.numeroSerie || null,
        ubicacion: dto.ubicacion || null,
        imagenUrl: dto.imagenUrl ?? null,
        stockActual: typeof dto.stockActual === 'number' ? dto.stockActual : null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId, action: 'ASSET_CREATED', targetType: 'Asset', targetId: asset.id,
        newValue: {
          marca: asset.marca, modelo: asset.modelo,
          numeroSerie: asset.numeroSerie, ubicacion: asset.ubicacion,
          responsableNombre: asset.responsableNombre,
          centroCosto: asset.centroCosto
        }
      }
    });

    return asset;
  }

  static async update(environmentId: string, id: string, dto: any, actorId: string) {
    const before = await prisma.asset.findFirst({ where: { id, environmentId } });
    if (!before) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        categoryId: dto.categoryId ?? before.categoryId,
        statusId: dto.statusId ?? before.statusId,
        responsableId: dto.responsableId !== undefined ? (dto.responsableId || null) : before.responsableId,
        responsableNombre: dto.responsableNombre !== undefined ? (dto.responsableNombre || null) : before.responsableNombre,
        centroCosto: dto.centroCosto !== undefined ? (dto.centroCosto || null) : before.centroCosto,
        marca: dto.marca ?? before.marca,
        modelo: dto.modelo ?? before.modelo,
        numeroSerie: dto.numeroSerie ?? before.numeroSerie,
        ubicacion: dto.ubicacion ?? before.ubicacion,
        imagenUrl: dto.imagenUrl !== undefined ? dto.imagenUrl : before.imagenUrl,
        stockActual: typeof dto.stockActual === 'number' ? dto.stockActual : before.stockActual
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId, action: 'ASSET_UPDATED', targetType: 'Asset', targetId: id,
        oldValue: {
          marca: before.marca, ubicacion: before.ubicacion,
          responsableNombre: before.responsableNombre, centroCosto: before.centroCosto,
          statusId: before.statusId
        },
        newValue: {
          marca: updated.marca, ubicacion: updated.ubicacion,
          responsableNombre: updated.responsableNombre, centroCosto: updated.centroCosto,
          statusId: updated.statusId
        }
      }
    });

    return updated;
  }

  static async assign(id: string, responsableId: string, actorId: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({ where: { id }, data: { responsableId } });

    await prisma.auditLog.create({
      data: {
        actorId, action: 'ASSET_ASSIGNED', targetType: 'Asset', targetId: id,
        oldValue: { responsableId: asset.responsableId },
        newValue: { responsableId }
      }
    });

    return updated;
  }

  static async changeStatus(id: string, statusId: string, actorId: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new Error('Activo no encontrado');

    const updated = await prisma.asset.update({ where: { id }, data: { statusId } });

    await prisma.auditLog.create({
      data: {
        actorId, action: 'ASSET_STATUS_CHANGED', targetType: 'Asset', targetId: id,
        oldValue: { statusId: asset.statusId },
        newValue: { statusId }
      }
    });

    return updated;
  }

  static async getById(environmentId: string, id: string) {
    const asset = await prisma.asset.findFirst({
      where: { id, environmentId },
      include: { category: true, status: true, responsable: true }
    });
    if (!asset) throw new Error('Activo no encontrado');
    return asset;
  }

  static async transfer(environmentId: string, id: string, dto: { responsableId?: string; responsableNombre?: string; ubicacion?: string }, actorId: string) {
    const asset = await prisma.asset.findFirst({ where: { id, environmentId } });
    if (!asset) throw new Error('Activo no encontrado');
    const updated = await prisma.asset.update({
      where: { id },
      data: {
        responsableId: dto.responsableId || null,
        responsableNombre: dto.responsableNombre || null,
        ubicacion: dto.ubicacion ?? asset.ubicacion
      }
    });
    await prisma.auditLog.create({
      data: {
        actorId, action: 'ASSET_TRANSFERRED', targetType: 'Asset', targetId: id,
        oldValue: { responsableId: asset.responsableId, responsableNombre: asset.responsableNombre, ubicacion: asset.ubicacion },
        newValue: { responsableId: dto.responsableId, responsableNombre: dto.responsableNombre, ubicacion: dto.ubicacion }
      }
    });
    return updated;
  }

  static history(assetId: string) {
    return prisma.auditLog.findMany({
      where: { targetType: 'Asset', targetId: assetId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createMovement(environmentId: string, assetId: string, dto: {
    direction: 'IN' | 'OUT';
    quantity: number;
    observations?: string;
  }, actorId: string) {
    const asset = await prisma.asset.findFirst({ where: { id: assetId, environmentId } });
    if (!asset) throw new Error('Activo no encontrado');

    const currentStock = asset.stockActual ?? 0;
    const newStock = dto.direction === 'IN'
      ? currentStock + dto.quantity
      : currentStock - dto.quantity;

    if (newStock < 0) throw new Error('Stock insuficiente para realizar la salida');

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: { stockActual: newStock }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: dto.direction === 'IN' ? 'ASSET_MOVEMENT_IN' : 'ASSET_MOVEMENT_OUT',
        targetType: 'Asset',
        targetId: assetId,
        oldValue: { stockActual: currentStock },
        newValue: {
          stockActual: newStock,
          quantity: dto.quantity,
          direction: dto.direction,
          observations: dto.observations || null
        }
      }
    });

    return { asset: updated, stockAnterior: currentStock, stockNuevo: newStock };
  }

  static async listMovements(environmentId: string, assetId: string) {
    const asset = await prisma.asset.findFirst({ where: { id: assetId, environmentId } });
    if (!asset) throw new Error('Activo no encontrado');

    return prisma.auditLog.findMany({
      where: {
        targetType: 'Asset',
        targetId: assetId,
        action: { in: ['ASSET_MOVEMENT_IN', 'ASSET_MOVEMENT_OUT'] }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
