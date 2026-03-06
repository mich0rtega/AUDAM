import { Router } from 'express';
import { AssetsController } from './assets.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.list
);

router.post(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.create
);

router.patch(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.update
);

router.patch(
  '/:id/assign',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.assign
);

router.patch(
  '/:id/status',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.changeStatus
);

router.get(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.getById
);

router.post(
  '/:id/transfer',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.transfer
);

router.get(
  '/:id/history',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.history
);

// Movimientos de activos (entradas / salidas de stock)
router.post(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.createMovement
);

router.get(
  '/:id/movements',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.listMovements
);


export default router;
