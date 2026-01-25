import { prisma } from '../config/prisma';

export class CostCentersService {

  static list(environmentId: string) {
    return prisma.costCenter.findMany({
      where: { environmentId },
      orderBy: { name: 'asc' }
    });
  }

  static create(
    environmentId: string,
    name: string,
    code?: string
  ) {
    return prisma.costCenter.create({
      data: {
        name,
        code,
        environmentId
      }
    });
  }

  static async toggle(id: string) {
    const current = await prisma.costCenter.findUnique({
      where: { id }
    });

    if (!current) {
      throw new Error('Centro de costo no encontrado');
    }

    return prisma.costCenter.update({
      where: { id },
      data: { isActive: !current.isActive }
    });
  }

}
