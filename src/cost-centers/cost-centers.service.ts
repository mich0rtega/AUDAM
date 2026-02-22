import { prisma } from '../config/prisma';

export class CostCentersService {

  static list(environmentId: string) {
    return prisma.costCenter.findMany({
      where: { environmentId },
      orderBy: { name: 'asc' }
    });
  }

  static async create(
    environmentId: string,
    name: string,
    code: string | undefined,
    actorId: string
  ) {
    const costCenter = await prisma.costCenter.create({
      data: {
        name,
        code,
        environmentId
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'COST_CENTER_CREATED',
        targetType: 'CostCenter',
        targetId: costCenter.id,
        newValue: costCenter
      }
    });

    return costCenter;
  }

  static async toggle(environmentId: string, id: string, actorId: string) {
    const current = await prisma.costCenter.findFirst({
      where: { id, environmentId }
    });

    if (!current) {
      throw new Error('Centro de costo no encontrado');
    }

    const costCenter = await prisma.costCenter.update({
      where: { id },
      data: { isActive: !current.isActive }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: costCenter.isActive ? 'COST_CENTER_ENABLED' : 'COST_CENTER_DISABLED',
        targetType: 'CostCenter',
        targetId: id,
        oldValue: { isActive: current.isActive },
        newValue: { isActive: costCenter.isActive }
      }
    });

    return costCenter;
  }

}
