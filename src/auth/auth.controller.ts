import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { roleEnvironmentAccess } from './permissions';
import { Environment } from './auth.types';
import { Role } from '@prisma/client';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
      const token = await AuthService.login(email, password);

      res.cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false // en prod true
      });

      return res.json({ message: 'Login exitoso' });
    } catch {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
  }

  static async getEnvironments(req: Request, res: Response) {
    const userId = req.user!.userId;

    const environments = await AuthService.getUserEnvironments(userId);

    const filtered = environments.filter(env =>
      roleEnvironmentAccess[env.role as Role].includes(
        env.name as Environment
      )
    );

    return res.json(
      filtered.map(env => ({
        id: env.id,
        name: env.name
      }))
    );
  }
}
