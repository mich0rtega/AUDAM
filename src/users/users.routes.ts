import { Router } from 'express';
import { UsersController } from './users.controller';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';

const router = Router();


router.get(
  '/environments',
  ...businessRoute([Role.ADMIN]),
  UsersController.listAllEnvironments
);

// Todos los usuarios globales
router.get(
  '/all',
  ...businessRoute([Role.ADMIN, Role.ALMACEN]),
  UsersController.listAll
);
router.get(
  '/',
  ...businessRoute([Role.ADMIN, Role.ALMACEN]),
  UsersController.list
);

// Ver usuario por id
router.get(
  '/:id',
  ...businessRoute([Role.ADMIN]),
  UsersController.getById
);

// Crear usuario
router.post(
  '/',
  ...businessRoute([Role.ADMIN]),
  UsersController.create
);

// Editar usuario (email / password)
router.patch(
  '/:id/update',
  ...businessRoute([Role.ADMIN]),
  UsersController.update
);

// Asignar rol en entorno activo
router.post(
  '/assign-role',
  ...businessRoute([Role.ADMIN]),
  UsersController.assignRole
);

// Asignar rol en entorno específico
router.post(
  '/assign-role-env',
  ...businessRoute([Role.ADMIN]),
  UsersController.assignRoleInEnvironment
);

// Cambiar rol de un userEnvironment
router.patch(
  '/change-role',
  ...businessRoute([Role.ADMIN]),
  UsersController.changeRole
);

// Revocar acceso a entorno (por userEnvironment.id)
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

// Habilitar usuario
router.patch(
  '/:id/enable',
  ...businessRoute([Role.ADMIN]),
  UsersController.enable
);

export default router;