import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import {
  signAccessToken,
  generateRefreshToken
} from '../config/jwt';
import { addDays } from 'date-fns';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      tokenVersion: user.tokenVersion
    });


    const refreshToken = generateRefreshToken();
    const expiresAt = addDays(new Date(), 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return { accessToken, refreshToken };
  }

  static async refreshSession(oldToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken }
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new Error('Refresh token inválido');
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId }
  });

  if (!user || !user.isActive) {
    throw new Error('Usuario inválido');
  }


  await prisma.refreshToken.update({
    where: { token: oldToken },
    data: { revoked: true }
  });


  const newRefreshToken = generateRefreshToken();
  const expiresAt = addDays(new Date(), 30);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt
    }
  });

 
  const accessToken = signAccessToken({
    userId: user.id,
    tokenVersion: user.tokenVersion
  });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
}

  static async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true }
    });
  }
  static async getUserEnvironments(userId: string) {
  const relations = await prisma.userEnvironment.findMany({
    where: { userId },
    include: { environment: true }
  });

  return relations.map(r => ({
    id: r.environment.id,
    name: r.environment.name,
    role: r.role
  }));
}

static async userHasEnvironment(userId: string, environmentId: string) {
  const relation = await prisma.userEnvironment.findUnique({
    where: {
      userId_environmentId: { userId, environmentId }
    }
  });

  return !!relation;
}


}

