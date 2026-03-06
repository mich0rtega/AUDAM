import { Router } from 'express';
import { businessRoute } from '../middlewares/business.middleware';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { Request, Response } from 'express';

const router = Router();

router.get(
  '/',
  businessRoute([Role.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const environmentId = req.context!.environmentId;
      const limit = parseInt(req.query.limit as string) || 300;

      // Obtenemos todos los actorIds que pertenecen a este entorno
      const relations = await prisma.userEnvironment.findMany({
        where: { environmentId },
        select: { userId: true }
      });
      const actorIds = relations.map(r => r.userId);

      const logs = await prisma.auditLog.findMany({
        where: {
          actorId: { in: actorIds }
        },
        include: {
          actor: { select: { id: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      res.json(logs);
    } catch (e) {
      res.status(500).json({ message: 'Error al obtener bitácora' });
    }
  }
);

export default router;
