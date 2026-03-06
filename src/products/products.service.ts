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
        sku: dto.sku,
        unit: dto.unit,
        stockActual: dto.stockActual ?? 0,
        imagenUrl: dto.imagenUrl ?? null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_CREATED',
        targetType: 'Product',
        targetId: product.id,
        newValue: {
          marca: product.marca,
          modelo: product.modelo,
          sku: product.sku,
          unit: product.unit,
          precioUnitario: Number(product.precioUnitario),
          stockActual: product.stockActual
        }
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
    const before = await prisma.product.findFirst({ where: { id, environmentId } });
    if (!before) throw new Error('Producto no encontrado');

    const product = await prisma.product.update({
      where: { id },
      data: {
        marca: dto.marca,
        modelo: dto.modelo,
        especificacion: dto.especificacion,
        statusId: dto.statusId,
        proveedorId: dto.proveedorId,
        imagenUrl: dto.imagenUrl !== undefined ? dto.imagenUrl : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'PRODUCT_UPDATED',
        targetType: 'Product',
        targetId: id,
        oldValue: {
          marca: before.marca,
          modelo: before.modelo,
          especificacion: before.especificacion,
          statusId: before.statusId,
          proveedorId: before.proveedorId
        },
        newValue: {
          marca: product.marca,
          modelo: product.modelo,
          especificacion: product.especificacion,
          statusId: product.statusId,
          proveedorId: product.proveedorId
        }
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
        targetId: id,
        oldValue: { isActive: true, marca: product.marca, sku: product.sku },
        newValue: { isActive: false, marca: product.marca, sku: product.sku }
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
        targetId: id,
        oldValue: { isActive: false, marca: product.marca, sku: product.sku },
        newValue: { isActive: true, marca: product.marca, sku: product.sku }
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

      const movement = await tx.movement.create({
        data: {
          environmentId,
          typeId: dto.typeId,
          responsibleId: actorId,
          costCenterId: dto.costCenterId,
          observations: dto.observations,
          details: {
            create: {
              productId: productId,  
              quantity: dto.quantity,
              unitPrice: dto.unitPrice,
              observations: dto.observations
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: dto.direction === 'IN' ? 'PRODUCT_MOVEMENT_IN' : 'PRODUCT_MOVEMENT_OUT',
          targetType: 'Movement',
          targetId: movement.id,
          oldValue: { stockAntes: product.stockActual },
          newValue: {
            stockDespues: newStock,
            cantidad: dto.quantity,
            producto: `${product.marca}${product.modelo ? ' ' + product.modelo : ''}`,
            sku: product.sku
          }
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
      where: {
        environmentId,
        details: {
          some: {
            productId: productId 
          }
        }
      },
      include: {
        type: true,
        responsible: true,
        costCenter: true,
        details: {
          where: {
            productId: productId
          },
          include: {
            product: {
              select: {
                marca: true,
                modelo: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' } 
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
        typeId: dto.typeId,
        responsibleId: actorId,
        costCenterId: dto.costCenterId,
        observations: dto.reason,
        details: {
          create: {
            productId: productId, 
            quantity: Math.abs(dto.quantity),
            unitPrice: product.precioUnitario,
            observations: dto.reason
          }
        }
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
        targetId: productId,
        oldValue: { stockActual: product.stockActual },
        newValue: { stockActual: newStock, ajuste: dto.quantity, razon: dto.reason }
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
      oldValue: { precioUnitario: Number(product.precioUnitario), marca: product.marca },
      newValue: { precioUnitario, marca: product.marca }
    }
  });

  return updated;
}

}
