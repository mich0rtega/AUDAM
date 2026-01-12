import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { jwtConfig } from '../config/jwt';
import { JwtBasePayload } from './auth.types';

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      environments: {
        include: { environment: true },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const payload: JwtBasePayload = {
    userId: user.id,
  };

  const token = jwt.sign(
    payload,
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  const availableEnvironments = user.environments.map((ue) => ({
    environment: ue.environment.name,
    role: ue.role,
  }));

  return { token, availableEnvironments };
}
