import { prisma } from '../config/prisma';
import { MovementDirection } from '@prisma/client';

const TARGET_TYPE_BY_MODEL: Record<string, string> = {
  productType: 'ProductType',
  productStatus: 'ProductStatus',
  movementType: 'MovementType',
  assetCategory: 'AssetCategory',
  provider: 'Provider'
};

export class CatalogService {


static async toggle(
  model:
    | 'productType'
    | 'productStatus'
    | 'movementType'
    | 'assetCategory'
    | 'provider',
  id: string,
  actorId: string
) {
  const current = await (prisma as any)[model].findUnique({ where: { id } });
  if (!current) throw new Error('No encontrado');

  const updated = await (prisma as any)[model].update({
    where: { id },
    data: { isActive: !current.isActive }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: updated.isActive ? `${model.toUpperCase()}_ENABLED` : `${model.toUpperCase()}_DISABLED`,
      targetType: TARGET_TYPE_BY_MODEL[model],
      targetId: id,
      oldValue: { isActive: current.isActive },
      newValue: { isActive: updated.isActive }
    }
  });

  return updated;
}


static listProductTypes(environmentId: string) {
  return prisma.productType.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static async createProductType(
  environmentId: string,
  name: string,
  description: string | undefined,
  actorId: string
) {
  const productType = await prisma.productType.create({
    data: { name, description, environmentId }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'PRODUCT_TYPE_CREATED',
      targetType: 'ProductType',
      targetId: productType.id,
      newValue: productType
    }
  });

  return productType;
}


static listProductStatus(environmentId: string) {
  return prisma.productStatus.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static async createProductStatus(environmentId: string, name: string, actorId: string) {
  const productStatus = await prisma.productStatus.create({
    data: { name, environmentId }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'PRODUCT_STATUS_CREATED',
      targetType: 'ProductStatus',
      targetId: productStatus.id,
      newValue: productStatus
    }
  });

  return productStatus;
}


static listMovementTypes(environmentId: string) {
  return prisma.movementType.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static async createMovementType(
  environmentId: string,
  name: string,
  direction: MovementDirection,
  actorId: string
) {
  const movementType = await prisma.movementType.create({
    data: { name, direction, environmentId }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'MOVEMENT_TYPE_CREATED',
      targetType: 'MovementType',
      targetId: movementType.id,
      newValue: movementType
    }
  });

  return movementType;
}


static listAssetCategories(environmentId: string) {
  return prisma.assetCategory.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static async createAssetCategory(environmentId: string, name: string, actorId: string) {
  const assetCategory = await prisma.assetCategory.create({
    data: { name, environmentId }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'ASSET_CATEGORY_CREATED',
      targetType: 'AssetCategory',
      targetId: assetCategory.id,
      newValue: assetCategory
    }
  });

  return assetCategory;
}


static listProviders(environmentId: string) {
  return prisma.provider.findMany({
    where: { environmentId },
    orderBy: { nombre: 'asc' }
  });
}

static async createProvider(environmentId: string, data: any, actorId: string) {
  const provider = await prisma.provider.create({
    data: {
      environmentId,
      nombre: data.nombre,
      contacto: data.contacto,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'PROVIDER_CREATED',
      targetType: 'Provider',
      targetId: provider.id,
      newValue: provider
    }
  });

  return provider;
}

}
