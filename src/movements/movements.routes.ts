import { Router } from 'express';
import { MovementsController } from './movements.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new MovementsController();



    

router.get('/', ...businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]), controller.findAll);
router.get('/:id', ...businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]), controller.findById);
router.get('/:id/pdf', ...businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]), controller.downloadPDF);
router.post('/', ...businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]), controller.create);
router.put('/:id', ...businessRoute([Role.ADMIN, Role.ALMACEN, Role.COMPRAS]), controller.update);
router.patch('/:id/remove', ...businessRoute([Role.ADMIN, Role.ALMACEN]), controller.remove);
router.patch('/:id/restore', ...businessRoute([Role.ADMIN, Role.ALMACEN]), controller.restore);

export default router;
