import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { roleEnvironmentAccess } from './permissions';
import { Environment } from './auth.types';
import { Role } from '@prisma/client';
import { clearCsrfCookie, csrfConfig, setCsrfCookie } from '../middlewares/csrf.middleware';

type UserEnvironmentDTO = {
  id: string;
  name: string;
  role: Role;
};

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const { accessToken, refreshToken } =
        await AuthService.login(email, password);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
      });

      const csrfToken = setCsrfCookie(res);

      res.json({
        message: 'Login exitoso',
        csrf: {
          token: csrfToken,
          headerName: csrfConfig.headerName
        }
      });
    } catch (err) {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  }

  static async me(req: Request, res: Response) {
    res.json({
      user: req.user
    });
  }

  static async logout(req: Request, res: Response) {
    const token = req.cookies.refresh_token;

    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({ message: 'Sesión cerrada correctamente' });
  }

  static async selectEnvironment(req: Request, res: Response) {
    const { environmentId } = req.body;
    const userId = req.user!.userId;

    if (!environmentId) {
      return res.status(400).json({ message: 'environmentId requerido' });
    }

    const hasAccess = await AuthService.userHasEnvironment(
      userId,
      environmentId
    );

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: 'Acceso denegado a este entorno' });
    }

    res.cookie('active_environment', environmentId, {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.json({ message: 'Entorno seleccionado correctamente' });
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    try {
      const { accessToken, refreshToken } =
        await AuthService.refreshSession(token);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
      });

      clearCsrfCookie(res);
      const csrfToken = setCsrfCookie(res);

      res.json({
        message: 'Sesión renovada',
        csrf: {
          token: csrfToken,
          headerName: csrfConfig.headerName
        }
      });
    } catch (err) {
      res.status(401).json({ message: 'Refresh inválido' });
    }
  }

  static async getEnvironments(req: Request, res: Response) {
    const userId = req.user!.userId;

    const environments = await AuthService.getUserEnvironments(userId);

    const filtered = environments.filter(env =>
      roleEnvironmentAccess[env.role as Role]?.includes(
        env.name as Environment
      )
    );

    return res.json(
      filtered.map(env => ({
        id: env.id,
        name: env.name,
        role: env.role
      }))
    );
  }
}
