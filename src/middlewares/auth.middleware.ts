import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { prisma } from '../config/prisma';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = (req as any).cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token revocado' });
    }

    req.user = {
      userId: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
