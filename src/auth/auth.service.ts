import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { jwtConfig } from '../config/jwt';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        environments: true
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return token;
  }

  static async getUserEnvironments(userId: string) {
    const relations = await prisma.userEnvironment.findMany({
      where: { userId },
      include: {
        environment: true
      }
    });

    return relations.map(r => ({
      id: r.environment.id,
      name: r.environment.name,
      role: r.role
    }));
  }
}
