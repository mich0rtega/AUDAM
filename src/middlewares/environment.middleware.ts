import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function setEnvironment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const environmentId = req.cookies.active_environment;
  const userId = req.user!.userId;

  if (!environmentId) {
    return res.status(400).json({
      message: 'Entorno no seleccionado'
    });
  }

  const relation = await prisma.userEnvironment.findUnique({
    where: {
      userId_environmentId: {
        userId,
        environmentId
      }
    },
    include: {
      environment: true
    }
  });

  if (!relation || !relation.isActive) {
    return res.status(403).json({
      message: 'Acceso revocado a este entorno'
    });
  }

  req.context = {
    environmentId: relation.environment.id,
    role: relation.role
  };

  next();
}
