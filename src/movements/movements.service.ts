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

  
  async create(dto: CreateMovementDto, environmentId: string) {
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

      return movement;
    });
  }


  async update(
    id: string,
    dto: UpdateMovementDto,
    environmentId: string
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

      return movement;
    });
  }


  async remove(id: string, environmentId: string) {
    const exists = await prisma.movement.findFirst({
      where: { id, environmentId }
    });

    if (!exists) {
      throw new Error('Movimiento no encontrado');
    }


    return prisma.movement.update({
      where: { id },
      data: {
        observations: '[ELIMINADO] ' + (exists.observations ?? '')
      }
    });
  }

  async getEnvironmentName(id: string) {
    const environment = await prisma.environment.findUnique({
      where: { id },
      select: { name: true }
    });
    return environment?.name || 'N/A';
  }
}
