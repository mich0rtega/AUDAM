import { Router } from 'express';
import { UsersController } from './users.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Listar todos los usuarios (global)
router.get(
  '/all',
  ...businessRoute([Role.ADMIN]),
  UsersController.listAll
);

// Listar usuarios del entorno activo
router.get(
  '/',
  ...businessRoute([Role.ADMIN]),
  UsersController.list
);

// Crear usuario
router.post(
  '/',
  ...businessRoute([Role.ADMIN]),
  UsersController.create
);

// Asignar rol en entorno
router.post(
  '/assign-role',
  ...businessRoute([Role.ADMIN]),
  UsersController.assignRole
);

// Cambiar rol
router.patch(
  '/change-role',
  ...businessRoute([Role.ADMIN]),
  UsersController.changeRole
);

// Revocar acceso a entorno
router.patch(
  '/environment/:id/revoke',
  ...businessRoute([Role.ADMIN]),
  UsersController.revokeEnvironment
);

// Restaurar acceso a entorno
router.patch(
  '/environment/:id/restore',
  ...businessRoute([Role.ADMIN]),
  UsersController.restoreEnvironment
);

// Deshabilitar usuario 
router.patch(
  '/:id/disable',
  ...businessRoute([Role.ADMIN]),
  UsersController.disable
);

// Rehabilitar usuario
router.patch(
  '/:id/enable',
  ...businessRoute([Role.ADMIN]),
  UsersController.enable
);

export default router;
