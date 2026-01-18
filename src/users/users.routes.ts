import { Router } from 'express';
import { UsersController } from './users.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { setEnvironment } from '../middlewares/environment.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate, setEnvironment, authorize(['ADMIN']));
// Muestra usuarios del entorno
router.get(
  '/',
  ...businessRoute([Role.ADMIN]),
  UsersController.list
);

// Asigna rol en el entorno
router.post(
  '/assign-role',
  ...businessRoute([Role.ADMIN]),
  UsersController.assignRole
);
router.post('/', UsersController.create);
router.post('/assign-role', UsersController.assignRole);
router.patch('/change-role', UsersController.changeRole);
router.patch('/:id/disable', UsersController.disable);
router.patch('/:id/enable', UsersController.enable);

export default router;
