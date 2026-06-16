import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async unreadCount(recipientAccountId: string) {
    return this.prisma.notification.count({
      where: { recipientAccountId, readAt: null },
    });
  }

  async list(recipientAccountId: string, page: number) {
    const take = 10;
    const skip = Math.max(0, (page - 1) * take);

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where: { recipientAccountId } }),
      this.prisma.notification.findMany({
        where: { recipientAccountId },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        include: {
          appointment: {
            select: {
              id: true,
              status: true,
              scheduledStartAt: true,
            },
          },
          assessment: {
            select: { id: true, severityLabel: true, completedAt: true },
          },
          sender: { select: { id: true, email: true, role: true } },
        },
      }),
    ]);

    return {
      notifications,
      pagination: { page, pageSize: take, total, hasMore: skip + notifications.length < total },
    };
  }

  async markSeen(notificationId: string, recipientAccountId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientAccountId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

