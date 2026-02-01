import { prisma } from '../config/prisma';
import { MovementDirection } from '@prisma/client';

export class ProductsService {

  static list(environmentId: string) {
    return prisma.product.findMany({
      where: { environmentId },
      include: {
        type: true,
        status: true,
        proveedor: true
      },
      orderBy: { marca: 'asc' }
    });
  }

  static async getById(environmentId: string, id: string) {
    const product = await prisma.product.findFirst({
      where: { id, environmentId },
      include: {
        type: true,
        status: true,
        proveedor: true
      }
    });

    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  static async create(
    environmentId: string,
    dto: any,
    actorId: string
  ) {
    const product = await prisma.product.create({
      data: {
        environmentId,
        typeId: dto.typeId,
        statusId: dto.statusId,
        proveedorId: dto.proveedorId,
        marca: dto.marca,
        modelo: dto.modelo,
        especificacion: dto.especificacion,
        precioUnitario: dto.precioUnitario,
        stockActual: 0
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_CREATED',
        targetType: 'Product',
        targetId: product.id
      }
    });

    return product;
  }

  static async update(
    environmentId: string,
    id: string,
    dto: any,
    actorId: string
  ) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        marca: dto.marca,
        modelo: dto.modelo,
        especificacion: dto.especificacion,
        statusId: dto.statusId,
        proveedorId: dto.proveedorId
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_UPDATED',
        targetType: 'Product',
        targetId: id
      }
    });

    return product;
  }

  static async disable(
    environmentId: string,
    id: string,
    actorId: string
  ) {
    const product = await prisma.product.findFirst({ where: { id, environmentId } });
    if (!product) throw new Error('Producto no encontrado');

    const updated = await prisma.product.update({ where: { id }, data: { isActive: false } });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_DISABLED',
        targetType: 'Product',
        targetId: id
      }
    });

    return updated;
  }

  static async enable(
    environmentId: string,
    id: string,
    actorId: string
  ) {
    const product = await prisma.product.findFirst({ where: { id, environmentId } });
    if (!product) throw new Error('Producto no encontrado');

    const updated = await prisma.product.update({ where: { id }, data: { isActive: true } });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_ENABLED',
        targetType: 'Product',
        targetId: id
      }
    });

    return updated;
  }

  static async createMovement(
    environmentId: string,
    productId: string,
    dto: any,
    actorId: string
  ) {
    return prisma.$transaction(async tx => {
      const product = await tx.product.findFirst({
        where: { id: productId, environmentId }
      });

      if (!product) throw new Error('Producto no encontrado');

      const newStock =
        dto.direction === MovementDirection.IN
          ? product.stockActual + dto.quantity
          : product.stockActual - dto.quantity;

      if (newStock < 0) {
        throw new Error('Stock insuficiente');
      }

      await tx.movement.create({
        data: {
          environmentId,
          productId,
          typeId: dto.typeId,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          responsibleId: actorId,
          costCenterId: dto.costCenterId
        }
      });

      return tx.product.update({
        where: { id: productId },
        data: { stockActual: newStock }
      });
    });
  }

  static listMovements(environmentId: string, productId: string) {
    return prisma.movement.findMany({
      where: { environmentId, productId },
      include: {
        type: true,
        responsible: true,
        costCenter: true
      },
      orderBy: { fecha: 'desc' }
    });
  }
  static async adjustStock(
  environmentId: string,
  productId: string,
  dto: {
    quantity: number;
    typeId: string;
    costCenterId: string;
    reason?: string;
  },
  actorId: string
) {
  return prisma.$transaction(async tx => {
    const product = await tx.product.findFirst({
      where: { id: productId, environmentId }
    });

    if (!product) throw new Error('Producto no encontrado');

    const newStock = product.stockActual + dto.quantity;

    if (newStock < 0) {
      throw new Error('Stock insuficiente');
    }

    await tx.movement.create({
      data: {
        environmentId,
        productId,
        typeId: dto.typeId,
        quantity: Math.abs(dto.quantity),
        unitPrice: product.precioUnitario,
        responsibleId: actorId,
        costCenterId: dto.costCenterId,
        observaciones: dto.reason
      }
    });

    const updated = await tx.product.update({
      where: { id: productId },
      data: { stockActual: newStock }
    });

    await tx.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_STOCK_ADJUSTED',
        targetType: 'Product',
        targetId: productId
      }
    });

    return updated;
  });
}

static async changePrice(
  environmentId: string,
  id: string,
  precioUnitario: number,
  actorId: string
) {
  if (precioUnitario <= 0) {
    throw new Error('Precio inválido');
  }

  const product = await prisma.product.findFirst({
    where: { id, environmentId }
  });

  if (!product) throw new Error('Producto no encontrado');

  const updated = await prisma.product.update({
    where: { id },
    data: { precioUnitario }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'PRODUCT_PRICE_CHANGED',
      targetType: 'Product',
      targetId: id,
      oldValue: { precioUnitario: product.precioUnitario },
      newValue: { precioUnitario }
    }
  });

  return updated;
}

}
