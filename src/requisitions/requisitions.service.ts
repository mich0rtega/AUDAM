import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';
import {
  CreateRequisitionDto,
  UpdateRequisitionDto,
  AuthorizeRequisitionDto,
  RequisitionFilters,
  RequisitionWithDetails
} from './requisitions.types';

const REQUISITION_INCLUDE = {
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
  requester: { select: { email: true } },
  authorizer: { select: { email: true } },
  almacenAuth: { select: { email: true } },
};

export class RequisitionsService {

  static async createRequisition(
    dto: CreateRequisitionDto,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const pendingStatus = await tx.requisitionStatus.findFirst({
        where: { environmentId, name: 'PENDIENTE' }
      });
      if (!pendingStatus) throw new Error('Estado PENDIENTE no encontrado en el entorno');

      let folio = dto.folio?.trim() || '';
      if (!folio) {
        folio = await RequisitionsService.getNextFolioInternal(tx, environmentId);
      }

      const req = await tx.requisition.create({
        data: {
          folio,
          solicitorId: actorId,
          solicitorName: dto.solicitorName,
          statusId: pendingStatus.id,
          destinationId: dto.destinationId,
          requesterId: actorId,
          environmentId,
          observations: dto.observations,
          details: {
            create: dto.details.map(detail => ({
              productId: detail.productId,
              quantity: detail.quantity,
              unitPrice: detail.unitPrice ?? 0,
              notes: detail.observations
            }))
          }
        },
        include: REQUISITION_INCLUDE
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
  }

  private static async getNextFolioInternal(tx: any, environmentId: string): Promise<string> {
    const last = await tx.requisition.findFirst({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
      select: { folio: true }
    });

    if (!last) return '0001';

    const lastNum = parseInt(last.folio.replace(/\D/g, '')) || 0;
    const next = lastNum + 1;
    return next.toString().padStart(4, '0');
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
      include: REQUISITION_INCLUDE,
      orderBy: { createdAt: 'desc' }
    }) as any;
  }

  static async getRequisitionById(
    id: string,
    environmentId: string
  ): Promise<RequisitionWithDetails | null> {
    return prisma.requisition.findFirst({
      where: { id, environmentId },
      include: REQUISITION_INCLUDE
    }) as any;
  }

  static async updateRequisition(
    id: string,
    dto: UpdateRequisitionDto,
    environmentId: string,
    actorId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const oldRequisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!oldRequisition) throw new Error('Requisición no encontrada');

      if (oldRequisition.status.name === 'PENDIENTE' && dto.statusId) {
        throw new Error('El estado no puede cambiarse manualmente mientras está PENDIENTE');
      }

      const updated = await tx.requisition.update({
        where: { id },
        data: dto,
        include: REQUISITION_INCLUDE
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_UPDATED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: { statusId: oldRequisition.statusId },
          newValue: { statusId: updated.statusId }
        }
      });

      return updated;
    });
  }

  /**
   * DOBLE AUTORIZACIÓN:
   * - Rol ALMACEN  → firma como "Encargado de Almacén"
   * - Rol AUTORIZADOR/ADMIN → firma como "Autorizador / Mesa Directiva"
   * - Solo cuando AMBAS firmas son `approved=true` → status AUTORIZADA
   * - Si CUALQUIERA rechaza → status RECHAZADA
   */
  static async authorizeRequisition(
    id: string,
    dto: AuthorizeRequisitionDto,
    environmentId: string,
    actorId: string,
    actorRole: Role
  ) {
    return prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!requisition) throw new Error('Requisición no encontrada');

      const statusName = requisition.status.name.toUpperCase();
      if (!['PENDIENTE', 'EN REVISION'].includes(statusName)) {
        throw new Error(`No se puede autorizar una requisición en estado ${requisition.status.name}`);
      }

      // Determinar qué campo actualizar según el rol
      const isAlmacen = actorRole === Role.ALMACEN;
      const isAutorizador = actorRole === Role.AUTORIZADOR || actorRole === Role.ADMIN;

      if (!isAlmacen && !isAutorizador) {
        throw new Error('Tu rol no tiene permiso para autorizar requisiciones');
      }

      // Si rechaza → estado RECHAZADA inmediatamente
      if (!dto.approved) {
        const rejectedStatus = await tx.requisitionStatus.findFirst({
          where: { environmentId, name: 'RECHAZADA' }
        });
        if (!rejectedStatus) throw new Error('Estado RECHAZADA no encontrado en el entorno');

        const updateData: any = {
          statusId: rejectedStatus.id,
          observations: dto.observations ?? requisition.observations,
        };

        if (isAlmacen) {
          updateData.almacenAuthId = actorId;
          updateData.almacenAuthAt = new Date();
          updateData.almacenApproved = false;
        } else {
          updateData.autorizadorAuthId = actorId;
          updateData.autorizadorAuthAt = new Date();
          updateData.autorizadorApproved = false;
          updateData.authorizerId = actorId;
        }

        const updated = await tx.requisition.update({
          where: { id },
          data: updateData,
          include: REQUISITION_INCLUDE
        });

        await tx.auditLog.create({
          data: {
            actorId,
            action: 'REQUISITION_REJECTED',
            targetType: 'Requisition',
            targetId: id,
            oldValue: { status: requisition.status.name },
            newValue: { status: rejectedStatus.name, role: actorRole, observations: dto.observations }
          }
        });

        return updated;
      }

      // Si aprueba → registrar su firma
      const updateData: any = {
        observations: dto.observations ?? requisition.observations
      };

      if (isAlmacen) {
        updateData.almacenAuthId = actorId;
        updateData.almacenAuthAt = new Date();
        updateData.almacenApproved = true;
      } else {
        updateData.autorizadorAuthId = actorId;
        updateData.autorizadorAuthAt = new Date();
        updateData.autorizadorApproved = true;
        updateData.authorizerId = actorId;
      }

      // Verificar si la OTRA firma ya está aprobada también
      const almacenApproved  = isAlmacen ? true : (requisition as any).almacenApproved;
      const autorizadorApproved = isAutorizador ? true : (requisition as any).autorizadorApproved;

      if (almacenApproved && autorizadorApproved) {
        // Ambas firmas completas → AUTORIZADA
        const approvedStatus = await tx.requisitionStatus.findFirst({
          where: { environmentId, name: 'AUTORIZADA' }
        });
        if (!approvedStatus) throw new Error('Estado AUTORIZADA no encontrado en el entorno');
        updateData.statusId = approvedStatus.id;
      } else {
        // Solo una firma, queda en revisión
        const reviewStatus = await tx.requisitionStatus.findFirst({
          where: { environmentId, name: { in: ['EN REVISION', 'PENDIENTE'] } },
          orderBy: { name: 'asc' }
        });
        if (reviewStatus && reviewStatus.name === 'EN REVISION') {
          updateData.statusId = reviewStatus.id;
        }
        // Si no hay estado EN REVISION, se queda en PENDIENTE (no cambia statusId)
      }

      const updated = await tx.requisition.update({
        where: { id },
        data: updateData,
        include: REQUISITION_INCLUDE
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_APPROVED_PARTIAL',
          targetType: 'Requisition',
          targetId: id,
          oldValue: { status: requisition.status.name },
          newValue: {
            status: updated.status?.name,
            role: actorRole,
            almacenApproved,
            autorizadorApproved
          }
        }
      });

      return updated;
    });
  }

  static async removeRequisition(id: string, environmentId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!requisition) throw new Error('Requisición no encontrada');

      if (!['BORRADOR', 'PENDIENTE'].includes(requisition.status.name)) {
        throw new Error('Solo se puede cancelar una requisición en borrador o pendiente');
      }

      const cancelledStatus = await tx.requisitionStatus.findFirst({
        where: { environmentId, name: 'CANCELADA' }
      });
      if (!cancelledStatus) throw new Error('Estado CANCELADA no encontrado en el entorno');

      const updated = await tx.requisition.update({
        where: { id },
        data: { statusId: cancelledStatus.id },
        include: REQUISITION_INCLUDE
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_CANCELLED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: { folio: requisition.folio, status: requisition.status.name },
          newValue: { status: cancelledStatus.name }
        }
      });

      return updated;
    });
  }

  static async restoreRequisition(id: string, environmentId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, environmentId },
        include: { status: true }
      });

      if (!requisition) throw new Error('Requisición no encontrada');

      if (requisition.status.name !== 'CANCELADA') {
        throw new Error('Solo se pueden restaurar requisiciones canceladas');
      }

      const pendingStatus = await tx.requisitionStatus.findFirst({
        where: { environmentId, name: 'PENDIENTE' }
      });
      if (!pendingStatus) throw new Error('Estado PENDIENTE no encontrado en el entorno');

      const updated = await tx.requisition.update({
        where: { id },
        data: {
          statusId: pendingStatus.id,
          almacenAuthId: null,
          almacenAuthAt: null,
          almacenApproved: null,
          autorizadorAuthId: null,
          autorizadorAuthAt: null,
          autorizadorApproved: null,
          authorizerId: null,
        } as any,
        include: REQUISITION_INCLUDE
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REQUISITION_RESTORED',
          targetType: 'Requisition',
          targetId: id,
          oldValue: { folio: requisition.folio, status: requisition.status.name },
          newValue: { status: pendingStatus.name }
        }
      });

      return updated;
    });
  }

  static async getNextFolio(environmentId: string): Promise<string> {
    const last = await prisma.requisition.findFirst({
      where: { environmentId },
      orderBy: { createdAt: 'desc' },
      select: { folio: true }
    });

    if (!last) return '0001';

    const lastNum = parseInt(last.folio.replace(/\D/g, '')) || 0;
    const next = lastNum + 1;
    return next.toString().padStart(4, '0');
  }
}