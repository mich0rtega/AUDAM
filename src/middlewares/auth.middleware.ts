import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = (req as any).cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const payload = verifyToken(token) as { userId: string; email: string };

    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
