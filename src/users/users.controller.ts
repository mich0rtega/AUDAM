import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

export class UsersController {
  static async list(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;

    const users =
      await UsersService.getUsersByEnvironment(environmentId);

    res.json(users);
  }

  static async assignRoleInEnvironment(req: Request, res: Response) {
    const environmentId = req.context!.environmentId;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    await UsersService.assignRoleInEnvironment(userId, environmentId, role);

    res.json({ message: 'Rol asignado correctamente' });
  }
   static async create(req: Request, res: Response) {
    const user = await UsersService.createUser(req.body, req.user!.userId);
    res.json(user);
  }

  static async assignRole(req: Request, res: Response) {
    const result = await UsersService.assignRole(req.body, req.user!.userId);
    res.json(result);
  }

  static async changeRole(req: Request, res: Response) {
    const result = await UsersService.changeRole(req.body, req.user!.userId);
    res.json(result);
  }

  static async disable(req: Request, res: Response) {
    await UsersService.disableUser(req.params.id, req.user!.userId);
    res.json({ message: 'Usuario desactivado' });
  }

  static async enable(req: Request, res: Response) {
    await UsersService.enableUser(req.params.id, req.user!.userId);
    res.json({ message: 'Usuario activado' });
  }
}
