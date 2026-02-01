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
  businessRoute([Role.ADMIN, Role.COMPRAS]),
  ProductsController.create
);

router.patch(
  '/:id',
  businessRoute([Role.ADMIN]),
  ProductsController.update
);

router.post(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.createMovement
);

router.get(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProductsController.listMovements
);

router.patch(
  '/:id/disable',
  businessRoute([Role.ADMIN]),
  ProductsController.disable
);

router.patch(
  '/:id/enable',
  businessRoute([Role.ADMIN]),
  ProductsController.enable
);


export default router;
