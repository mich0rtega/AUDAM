import { Router } from 'express';
import { ProductsController } from './products.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  ProductsController.list
);

router.get(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  ProductsController.getById
);

router.post(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.create
);

router.patch(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.update
);

router.post(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.createMovement
);

router.get(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  ProductsController.listMovements
);

router.patch(
  '/:id/disable',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.disable
);

router.patch(
  '/:id/enable',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.enable
);

// Ajuste manual de inventario
router.post(
  '/:id/adjust-stock',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.adjustStock
);

// Cambio de precio controlado
router.patch(
  '/:id/price',
  businessRoute([Role.ADMIN]),
  ProductsController.changePrice
);

export default router;