import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  CreateUserDto,
  AssignRoleDto,
  ChangeRoleDto
} from './users.types';

export class UsersService {

  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        environments: {
          include: {
            environment: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        environments: {
          include: {
            environment: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  static async getUsersByEnvironment(environmentId: string) {
    const relations = await prisma.userEnvironment.findMany({
      where: { environmentId },
      include: { user: true }
    });

    return relations.map(r => ({
      id: r.user.id,
      email: r.user.email,
      role: r.role
    }));
  }

  static async createUser(dto: CreateUserDto, actorId: string) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: { email: dto.email, password: passwordHash }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'USER_CREATED',
        targetType: 'User',
        targetId: user.id
      }
    });

    return user;
  }

  static async updateUser(userId: string, data: { email?: string; password?: string }, actorId: string) {
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, isActive: true, createdAt: true }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'USER_UPDATED',
        targetType: 'User',
        targetId: userId,
        newValue: { email: data.email ? data.email : undefined }
      }
    });

    return user;
  }

  static async assignRole(dto: AssignRoleDto, actorId: string) {
    const ue = await prisma.userEnvironment.create({ data: dto });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ROLE_ASSIGNED',
        targetType: 'UserEnvironment',
        targetId: ue.id
      }
    });

    return ue;
  }

  static async assignRoleInEnvironment(userId: string, environmentId: string, role: Role) {
    return prisma.userEnvironment.upsert({
      where: { userId_environmentId: { userId, environmentId } },
      update: { role, isActive: true, revokedAt: null },
      create: { userId, environmentId, role }
    });
  }

  static async changeRole(dto: ChangeRoleDto, actorId: string) {
    const ue = await prisma.userEnvironment.update({
      where: { id: dto.userEnvironmentId },
      data: { role: dto.role }
    });

    await prisma.user.update({
      where: { id: ue.userId },
      data: { tokenVersion: { increment: 1 } }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'ROLE_CHANGED',
        targetType: 'User',
        targetId: ue.userId
      }
    });

    return ue;
  }

  static async disableUser(userId: string, actorId: string) {
    return prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isActive: false, tokenVersion: { increment: 1 } }
      }),
      prisma.auditLog.create({
        data: { actorId, action: 'USER_DISABLED', targetType: 'User', targetId: userId }
      })
    ]);
  }

  static async enableUser(userId: string, actorId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true, tokenVersion: { increment: 1 } }
    });

    await prisma.auditLog.create({
      data: { actorId, action: 'USER_ENABLED', targetType: 'User', targetId: userId }
    });
  }

  static async revokeEnvironmentAccess(userEnvironmentId: string, actorId: string) {
    return prisma.$transaction([
      prisma.userEnvironment.update({
        where: { id: userEnvironmentId },
        data: { isActive: false, revokedAt: new Date() }
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: 'ENVIRONMENT_REVOKED',
          targetType: 'UserEnvironment',
          targetId: userEnvironmentId
        }
      })
    ]);
  }

  static async restoreEnvironmentAccess(userEnvironmentId: string, actorId: string) {
    return prisma.$transaction([
      prisma.userEnvironment.update({
        where: { id: userEnvironmentId },
        data: { isActive: true, revokedAt: null }
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: 'ENVIRONMENT_RESTORED',
          targetType: 'UserEnvironment',
          targetId: userEnvironmentId
        }
      })
    ]);
  }

  // Listar todos los entornos del sistema
  static async listAllEnvironments() {
    return prisma.environment.findMany({
      select: { id: true, name: true }
    });
  }
}