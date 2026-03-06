import { Router } from 'express';
import { CostCentersController } from './cost-centers.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  CostCentersController.list
);

router.post(
  '/',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  CostCentersController.create
);

router.patch(
  '/:id/toggle',
  businessRoute([Role.ADMIN, Role.ALMACEN]),
  CostCentersController.toggle
);

export default router;