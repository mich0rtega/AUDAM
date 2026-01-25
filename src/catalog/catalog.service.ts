import { prisma } from '../config/prisma';
import { MovementDirection } from '@prisma/client';

export class CatalogService {


static async toggle(
  model:
    | 'productType'
    | 'productStatus'
    | 'movementType'
    | 'assetCategory'
    | 'provider',
  id: string
) {
  const current = await (prisma as any)[model].findUnique({ where: { id } });
  if (!current) throw new Error('No encontrado');

  return (prisma as any)[model].update({
    where: { id },
    data: { isActive: !current.isActive }
  });
}


static listProductTypes(environmentId: string) {
  return prisma.productType.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static createProductType(
  environmentId: string,
  name: string,
  description?: string
) {
  return prisma.productType.create({
    data: { name, description, environmentId }
  });
}


static listProductStatus(environmentId: string) {
  return prisma.productStatus.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static createProductStatus(environmentId: string, name: string) {
  return prisma.productStatus.create({
    data: { name, environmentId }
  });
}


static listMovementTypes(environmentId: string) {
  return prisma.movementType.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static createMovementType(
  environmentId: string,
  name: string,
  direction: MovementDirection
) {
  return prisma.movementType.create({
    data: { name, direction, environmentId }
  });
}


static listAssetCategories(environmentId: string) {
  return prisma.assetCategory.findMany({
    where: { environmentId },
    orderBy: { name: 'asc' }
  });
}

static createAssetCategory(environmentId: string, name: string) {
  return prisma.assetCategory.create({
    data: { name, environmentId }
  });
}


static listProviders(environmentId: string) {
  return prisma.provider.findMany({
    where: { environmentId },
    orderBy: { nombre: 'asc' }
  });
}

static createProvider(environmentId: string, data: any) {
  return prisma.provider.create({
    data: {
      environmentId,
      nombre: data.nombre,
      contacto: data.contacto,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion
    }
  });
}

}
