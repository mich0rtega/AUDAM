import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { signToken } from '../config/jwt';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { environments: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    return signToken({ userId: user.id });
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
