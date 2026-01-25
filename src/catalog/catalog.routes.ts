import { Router } from 'express';
import { CatalogController } from './catalog.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Product Types
router.get(
  '/product-types',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  CatalogController.listProductTypes
);

router.post(
  '/product-types',
  businessRoute([Role.ADMIN]),
  CatalogController.createProductType
);

router.patch(
  '/product-types/:id/toggle',
  businessRoute([Role.ADMIN]),
  CatalogController.toggleProductType
);

// Product Status
router.get(
  '/product-status',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  CatalogController.listProductStatus
);

router.post(
  '/product-status',
  businessRoute([Role.ADMIN]),
  CatalogController.createProductStatus
);

router.patch(
  '/product-status/:id/toggle',
  businessRoute([Role.ADMIN]),
  CatalogController.toggleProductStatus
);

//movement types
router.get(
  '/movement-types',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  CatalogController.listMovementTypes
);

router.post(
  '/movement-types',
  businessRoute([Role.ADMIN]),
  CatalogController.createMovementType
);

router.patch(
  '/movement-types/:id/toggle',
  businessRoute([Role.ADMIN]),
  CatalogController.toggleMovementType
);

// Asset Categories
router.get(
  '/asset-categories',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  CatalogController.listAssetCategories
);

router.post(
  '/asset-categories',
  businessRoute([Role.ADMIN]),
  CatalogController.createAssetCategory
);

router.patch(
  '/asset-categories/:id/toggle',
  businessRoute([Role.ADMIN]),
  CatalogController.toggleAssetCategory
);

// Providers
router.get(
  '/providers',
  businessRoute([Role.ADMIN, Role.COMPRAS]),
  CatalogController.listProviders
);

router.post(
  '/providers',
  businessRoute([Role.ADMIN]),
  CatalogController.createProvider
);

router.patch(
  '/providers/:id/toggle',
  businessRoute([Role.ADMIN]),
  CatalogController.toggleProvider
);

export default router;
