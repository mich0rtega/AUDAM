import { Request, Response, NextFunction } from 'express';
import { Environment } from '../auth/auth.types';

export function requireEnvironment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const environment = req.cookies?.active_environment;

  if (!environment) {
    return res.status(400).json({
      message: 'No hay entorno activo seleccionado',
    });
  }

  if (!Object.values(Environment).includes(environment)) {
    return res.status(400).json({
      message: 'Entorno inválido',
    });
  }

  req.environment = environment as Environment;
  next();
}
