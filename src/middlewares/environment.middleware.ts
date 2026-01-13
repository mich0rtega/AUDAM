import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function setEnvironment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const environmentName = req.headers['x-environment'] as string;
  const userId = req.user!.userId;

  if (!environmentName) {
    return res.status(400).json({ message: 'Entorno no seleccionado' });
  }

  const environment = await prisma.environment.findUnique({
    where: { name: environmentName }
  });

  if (!environment) {
    return res.status(400).json({ message: 'Entorno inválido' });
  }

  const relation = await prisma.userEnvironment.findUnique({
    where: {
      userId_environmentId: {
        userId,
        environmentId: environment.id
      }
    }
  });

  if (!relation) {
    return res.status(403).json({ message: 'Acceso denegado al entorno' });
  }

  req.context = {
    environmentId: environment.id,
    role: relation.role
  };

  next();
}
