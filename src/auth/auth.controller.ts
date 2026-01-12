import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { Environment } from './auth.types';



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Usuario no válido' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
  });

  res.json({ message: 'Login exitoso' });
};


export const me = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  res.json({
    user,
    environment: req.cookies?.active_environment ?? null,
  });
};



export const selectEnvironment = async (req: Request, res: Response) => {
  const { environment } = req.body;

  if (!Object.values(Environment).includes(environment)) {
    return res.status(400).json({ message: 'Entorno inválido' });
  }

  res.cookie('active_environment', environment, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({
    message: 'Entorno seleccionado',
    environment,
  });
};


export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('active_environment');

  res.json({ message: 'Sesión cerrada' });
};
