import { Router } from 'express';
import { Role } from '@prisma/client';
import { businessRoute } from '../middlewares/business.middleware';
import { ProvidersController } from './providers.controller';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProvidersController.list
);

router.get(
  '/:id',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  ProvidersController.getById
);

router.post(
  '/',
  businessRoute([Role.ADMIN]),
  ProvidersController.create
);

router.put(
  '/:id',
  businessRoute([Role.ADMIN]),
  ProvidersController.update
);

router.patch(
  '/:id/toggle',
  businessRoute([Role.ADMIN]),
  ProvidersController.toggle
);

export default router;
