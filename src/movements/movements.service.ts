import { prisma } from '../config/prisma';

import {
  CreateMovementDto,
  UpdateMovementDto
} from './movements.types';

export class MovementsService {


  async findAll(environmentId: string) {
    return prisma.movement.findMany({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
      include: {
        type: true,
        costCenter: true,
        responsible: {
          select: { id: true, email: true }
        },
        details: {
          include: {
            product: true
          }
        }
      }
    });
  }


  async findById(id: string, environmentId: string) {
    const movement = await prisma.movement.findFirst({
      where: { id, environmentId },
      include: {
        type: true,
        costCenter: true,
        responsible: {
          select: { id: true, email: true }
        },
        details: {
          include: {
            product: true
          }
        }
      }
    });

    if (!movement) {
      throw new Error('Movimiento no encontrado');
    }

    return movement;
  }

  
  async create(dto: CreateMovementDto, environmentId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const movement = await tx.movement.create({
        data: {
          environmentId,
          typeId: dto.typeId,
          responsibleId: dto.responsibleId,
          costCenterId: dto.costCenterId ?? null,
          observations: dto.observations ?? null,
          details: {
            create: dto.details.map((d) => ({
              productId: d.productId,
              quantity: d.quantity,
              unitPrice: d.unitPrice,
              observations: d.observations ?? null
            }))
          }
        },
        include: {
          type: true,
          costCenter: true,
          responsible: {
            select: { id: true, email: true }
          },
          details: {
            include: {
              product: true
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'MOVEMENT_CREATED',
          targetType: 'Movement',
          targetId: movement.id,
          newValue: {
            typeId: movement.typeId,
            responsibleId: movement.responsibleId,
            costCenterId: movement.costCenterId,
            detailsCount: movement.details.length
          }
        }
      });

      return movement;
    });
  }


  async update(
    id: string,
    dto: UpdateMovementDto,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {

      const exists = await tx.movement.findFirst({
        where: { id, environmentId }
      });

      if (!exists) {
        throw new Error('Movimiento no encontrado');
      }

      const movement = await tx.movement.update({
        where: { id },
        data: {
          typeId: dto.typeId ?? undefined,
          responsibleId: dto.responsibleId ?? undefined,
          costCenterId: dto.costCenterId ?? undefined,
          observations: dto.observations ?? undefined
        },
        include: {
          type: true,
          costCenter: true,
          responsible: {
            select: { id: true, email: true }
          },
          details: {
            include: {
              product: true
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'MOVEMENT_UPDATED',
          targetType: 'Movement',
          targetId: id,
          oldValue: {
            typeId: exists.typeId,
            responsibleId: exists.responsibleId,
            costCenterId: exists.costCenterId,
            observations: exists.observations
          },
          newValue: {
            typeId: movement.typeId,
            responsibleId: movement.responsibleId,
            costCenterId: movement.costCenterId,
            observations: movement.observations
          }
        }
      });

      return movement;
    });
  }


  async remove(id: string, environmentId: string, actorId: string) {
    const exists = await prisma.movement.findFirst({
      where: { id, environmentId }
    });

    if (!exists) {
      throw new Error('Movimiento no encontrado');
    }

    const currentObservations = exists.observations ?? '';

    if (currentObservations.startsWith('[ELIMINADO]')) {
      throw new Error('El movimiento ya está marcado como eliminado');
    }

    const movement = await prisma.movement.update({
      where: { id },
      data: {
        observations: `[ELIMINADO] ${currentObservations}`.trim()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'MOVEMENT_REMOVED',
        targetType: 'Movement',
        targetId: id,
        oldValue: { observations: exists.observations },
        newValue: { observations: movement.observations }
      }
    });

    return movement;
  }

  async restore(id: string, environmentId: string, actorId: string) {
    const exists = await prisma.movement.findFirst({
      where: { id, environmentId }
    });

    if (!exists) {
      throw new Error('Movimiento no encontrado');
    }

    const currentObservations = exists.observations ?? '';

    if (!currentObservations.startsWith('[ELIMINADO]')) {
      throw new Error('El movimiento no está marcado como eliminado');
    }

    const restoredObservations = currentObservations.replace(/^\[ELIMINADO\]\s*/, '') || null;

    const movement = await prisma.movement.update({
      where: { id },
      data: {
        observations: restoredObservations
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'MOVEMENT_RESTORED',
        targetType: 'Movement',
        targetId: id,
        oldValue: { observations: exists.observations },
        newValue: { observations: movement.observations }
      }
    });

    return movement;
  }

  async getEnvironmentName(id: string) {
    const environment = await prisma.environment.findUnique({
      where: { id },
      select: { name: true }
    });
    return environment?.name || 'N/A';
  }
}
