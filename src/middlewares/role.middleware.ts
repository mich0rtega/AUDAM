import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.context?.role;

    if (!role || !allowedRoles.includes(role as Role)) {
      return res.status(403).json({ message: 'Permiso denegado' });
    }

    next();
  };
}
