import { Router } from 'express';
import { RequisitionsController } from './requisitions.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();


router.get(
  '/next-folio',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.COMPRAS, Role.AUTORIZADOR, Role.ADMIN]),
  RequisitionsController.getNextFolio
);


router.get(
  '/',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.COMPRAS, Role.AUTORIZADOR, Role.ADMIN]),
  RequisitionsController.list
);


router.get(
  '/:id',
  ...businessRoute([Role.USUARIO, Role.ALMACEN, Role.COMPRAS, Role.AUTORIZADOR, Role.ADMIN]),
  RequisitionsController.getById
);


router.get(
  '/:id/pdf',
  ...businessRoute([Role.COMPRAS, Role.ALMACEN, Role.ADMIN]),
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

router.post(
  '/:id/authorize',
  ...businessRoute([Role.AUTORIZADOR, Role.ADMIN]),
  RequisitionsController.authorize
);


router.delete(
  '/:id',
  ...businessRoute([Role.ALMACEN, Role.ADMIN]),
  RequisitionsController.delete
);

export default router;
