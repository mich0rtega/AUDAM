import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  CreateUserDto,
  AssignRoleDto,
  ChangeRoleDto
} from './users.types';

export class UsersService {
  static async getUsersByEnvironment(environmentId: string) {
    const relations = await prisma.userEnvironment.findMany({
      where: { environmentId },
      include: {
        user: true
      }
    });

    return relations.map(r => ({
      id: r.user.id,
      email: r.user.email,
      role: r.role
    }));
  }

  static async assignRoleInEnvironment(
    userId: string,
    environmentId: string,
    role: Role
  ) {
    return prisma.userEnvironment.upsert({
      where: {
        userId_environmentId: { userId, environmentId }
      },
      update: { role },
      create: {
        userId,
        environmentId,
        role
      }
    });
  }

 static async createUser(dto: CreateUserDto, actorId: string) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash
      }
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

  static async assignRole(dto: AssignRoleDto, actorId: string) {
    const ue = await prisma.userEnvironment.create({
      data: dto
    });

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
        data: {
          isActive: false,
          tokenVersion: { increment: 1 }
        }
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: 'USER_DISABLED',
          targetType: 'User',
          targetId: userId
        }
      })
    ]);
  }

  static async enableUser(userId: string, actorId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        tokenVersion: { increment: 1 }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'USER_ENABLED',
        targetType: 'User',
        targetId: userId
      }
    });
  }
}



