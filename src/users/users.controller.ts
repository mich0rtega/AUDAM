import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

export class UsersController {

  static async listAll(req: Request, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      res.json(users);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const user = await UsersService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const environmentId = req.context!.environmentId;
      const users = await UsersService.getUsersByEnvironment(environmentId);
      res.json(users);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = await UsersService.createUser(req.body, req.user!.userId);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const user = await UsersService.updateUser(req.params.id, req.body, req.user!.userId);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async assignRole(req: Request, res: Response) {
    try {
      const result = await UsersService.assignRole(req.body, req.user!.userId);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async assignRoleInEnvironment(req: Request, res: Response) {
    try {
      const environmentId = req.context!.environmentId;
      const { userId, role } = req.body;

      if (!userId || !role) return res.status(400).json({ message: 'Datos incompletos' });
      if (!Object.values(Role).includes(role)) return res.status(400).json({ message: 'Rol inválido' });

      await UsersService.assignRoleInEnvironment(userId, environmentId, role);
      res.json({ message: 'Rol asignado correctamente' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async changeRole(req: Request, res: Response) {
    try {
      const result = await UsersService.changeRole(req.body, req.user!.userId);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async disable(req: Request, res: Response) {
    try {
      await UsersService.disableUser(req.params.id, req.user!.userId);
      res.json({ message: 'Usuario desactivado' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async enable(req: Request, res: Response) {
    try {
      await UsersService.enableUser(req.params.id, req.user!.userId);
      res.json({ message: 'Usuario activado' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async revokeEnvironment(req: Request, res: Response) {
    try {
      await UsersService.revokeEnvironmentAccess(req.params.id, req.user!.userId);
      res.json({ message: 'Acceso al entorno revocado' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async restoreEnvironment(req: Request, res: Response) {
    try {
      await UsersService.restoreEnvironmentAccess(req.params.id, req.user!.userId);
      res.json({ message: 'Acceso al entorno restaurado' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  static async listAllEnvironments(req: Request, res: Response) {
    try {
      const envs = await UsersService.listAllEnvironments();
      res.json(envs);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }
}