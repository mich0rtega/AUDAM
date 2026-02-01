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
  businessRoute([Role.ADMIN]),
  AssetsController.create
);

router.patch(
  '/:id',
  businessRoute([Role.ADMIN]),
  AssetsController.update
);

router.patch(
  '/:id/assign',
  businessRoute([Role.ADMIN]),
  AssetsController.assign
);

router.patch(
  '/:id/status',
  businessRoute([Role.ADMIN]),
  AssetsController.changeStatus
);

router.get(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  AssetsController.getById
);

router.post(
  '/:id/transfer',
  businessRoute([Role.ADMIN]),
  AssetsController.transfer
);

router.get(
  '/:id/history',
  businessRoute([Role.ADMIN]),
  AssetsController.history
);


export default router;
