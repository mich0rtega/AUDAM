import { Router } from 'express';
import { Role } from '@prisma/client';
import { businessRoute } from '../middlewares/business.middleware';
import { ProvidersController } from './providers.controller';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  ProvidersController.list
);

router.get(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]),
  ProvidersController.getById
);

router.post(
  '/',
  businessRoute([Role.ADMIN, Role.COMPRAS]),
  ProvidersController.create
);

router.put(
  '/:id',
  businessRoute([Role.ADMIN, Role.COMPRAS]),
  ProvidersController.update
);

router.patch(
  '/:id/toggle',
  businessRoute([Role.ADMIN]),
  ProvidersController.toggle
);

export default router;
