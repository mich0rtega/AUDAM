import { Router } from 'express';
import { Role } from '@prisma/client';
import { businessRoute } from '../middlewares/business.middleware';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get(
  '/',
  businessRoute([
    Role.ADMIN,
    Role.ALMACEN,
    Role.AUTORIZADOR,
    Role.COMPRAS
  ]),
  DashboardController.overview
);

export default router;
