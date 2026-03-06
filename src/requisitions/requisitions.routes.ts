import { Router } from 'express';
import { RequisitionsController } from './requisitions.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/next-folio',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.AUTORIZADOR, Role.ADMIN, Role.COMPRAS]),
  RequisitionsController.getNextFolio
);

router.get(
  '/',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.AUTORIZADOR, Role.ADMIN, Role.COMPRAS]),
  RequisitionsController.list
);

router.get(
  '/:id',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.AUTORIZADOR, Role.ADMIN, Role.COMPRAS]),
  RequisitionsController.getById
);

router.get(
  '/:id/pdf',
  ...businessRoute([Role.ALMACEN, Role.ADMIN, Role.AUTORIZADOR]),
  RequisitionsController.downloadPDF
);

router.post(
  '/',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.ADMIN]),
  RequisitionsController.create
);

router.patch(
  '/:id',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.ADMIN]),
  RequisitionsController.update
);

// DOBLE AUTORIZACIÓN: tanto ALMACEN como AUTORIZADOR/ADMIN pueden firmar
router.post(
  '/:id/authorize',
  ...businessRoute([Role.ALMACEN, Role.AUTORIZADOR, Role.ADMIN]),
  RequisitionsController.authorize
);

router.patch(
  '/:id/remove',
  ...businessRoute([Role.ALMACEN, Role.ADMIN]),
  RequisitionsController.remove
);

router.patch(
  '/:id/restore',
  ...businessRoute([Role.ALMACEN, Role.ADMIN]),
  RequisitionsController.restore
);

export default router;