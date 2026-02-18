import { prisma } from '../config/prisma';
import {
  CreateRequisitionDto,
  UpdateRequisitionDto,
  AuthorizeRequisitionDto,
  RequisitionFilters,
  RequisitionWithDetails
} from './requisitions.types';

export class RequisitionsService {

  static async createRequisition(
    dto: CreateRequisitionDto,
    environmentId: string,
    actorId: string
  ) {
    const requisition = await prisma.$transaction(async (tx) => {

      const req = await tx.requisition.create({
        data: {
          folio: dto.folio,
          solicitorId: dto.solicitorId,
          solicitorName: dto.solicitorName,
          statusId: dto.statusId,
          destinationId: dto.destinationId,
          requesterId: dto.solicitorId, // requesterId es el mismo que solicitorId
          environmentId,
          details: {
            create: dto.details.map(detail => ({
              productId: detail.productId,
              quantity: detail.quantity,
              unitPrice: detail.unitPrice || 0,
              notes: detail.observations
            }))
          }
        },
        include: {
          details: {
            include: {
              product: {
                select: {
                  marca: true,
                  modelo: true,
                  sku: true,
                  unit: true
                }
              }
            }
          },
          status: true,
          destination: true,
          requester: {
            select: {
              email: true
            }
          }
        }
      });


      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_CREATED',
          targetType: 'Requisition',
          targetId: req.id,
          newValue: {
            folio: req.folio,
            solicitorName: req.solicitorName,
            destination: req.destination.name,
            itemsCount: req.details.length
          }
        }
      });

      return req;
    });

    return requisition;
  }

  
  static async getRequisitions(
    environmentId: string,
    filters?: RequisitionFilters
  ): Promise<RequisitionWithDetails[]> {
    const where: any = { environmentId };

    if (filters?.statusId) where.statusId = filters.statusId;
    if (filters?.solicitorId) where.solicitorId = filters.solicitorId;
    if (filters?.folio) where.folio = { contains: filters.folio, mode: 'insensitive' };
    if (filters?.costCenterId) where.destinationId = filters.costCenterId;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.requisition.findMany({
      where,
      include: {
        details: {
          include: {
            product: {
              select: {
                marca: true,
                modelo: true,
                sku: true,
                unit: true
              }
            }
          }
        },
        status: true,
        destination: true,
        requester: {
          select: {
            email: true
          }
        },
        authorizer: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getRequisitionById(
    id: string,
    environmentId: string
  ): Promise<RequisitionWithDetails | null> {
    return prisma.requisition.findFirst({
      where: {
        id,
        environmentId
      },
      include: {
        details: {
          include: {
            product: {
              select: {
                marca: true,
                modelo: true,
                sku: true,
                unit: true
              }
            }
          }
        },
        status: true,
        destination: true,
        requester: {
          select: {
            email: true
          }
        },
        authorizer: {
          select: {
            email: true
          }
        }
      }
    });
  }

  static async updateRequisition(
    id: string,
    dto: UpdateRequisitionDto,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const oldRequisition = await tx.requisition.findFirst({
        where: { id, environmentId }
      });

      if (!oldRequisition) {
        throw new Error('Requisición no encontrada');
      }

      const updated = await tx.requisition.update({
        where: { id },
        data: dto,
        include: {
          details: {
            include: {
              product: true
            }
          },
          status: true,
          destination: true
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_UPDATED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: {
            statusId: oldRequisition.statusId,
            observations: oldRequisition.observations
          },
          newValue: {
            statusId: updated.statusId,
            observations: updated.observations
          }
        }
      });

      return updated;
    });
  }


  static async authorizeRequisition(
    id: string,
    dto: AuthorizeRequisitionDto,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!requisition) {
        throw new Error('Requisición no encontrada');
      }


      const newStatus = await tx.requisitionStatus.findFirst({
        where: {
          environmentId,
          name: dto.approved ? 'AUTORIZADA' : 'RECHAZADA'
        }
      });

      if (!newStatus) {
        throw new Error('Estado no encontrado');
      }

      const updated = await tx.requisition.update({
        where: { id },
        data: {
          authorizerId: dto.authorizerId,
          statusId: newStatus.id,
          observations: dto.observations
        },
        include: {
          details: {
            include: {
              product: true
            }
          },
          status: true,
          destination: true,
          authorizer: {
            select: {
              email: true
            }
          }
        }
      });

 
      await tx.auditLog.create({
        data: {
          actorId,
          action: dto.approved ? 'REQUISITION_APPROVED' : 'REQUISITION_REJECTED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: {
            status: requisition.status.name
          },
          newValue: {
            status: newStatus.name,
            authorizer: dto.authorizerId,
            observations: dto.observations
          }
        }
      });

      return updated;
    });
  }


  static async deleteRequisition(
    id: string,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!requisition) {
        throw new Error('Requisición no encontrada');
      }

      if (!['BORRADOR', 'PENDIENTE'].includes(requisition.status.name)) {
        throw new Error('No se puede eliminar una requisición autorizada o en proceso');
      }

      await tx.requisition.delete({
        where: { id }
      });


      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_DELETED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: {
            folio: requisition.folio,
            status: requisition.status.name
          }
        }
      });
    });
  }

  static async getNextFolio(environmentId: string): Promise<string> {
    const lastRequisition = await prisma.requisition.findFirst({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
      select: { folio: true }
    });

    if (!lastRequisition) {
      return '000001';
    }

    const lastNumber = parseInt(lastRequisition.folio);
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(6, '0');
  }
}