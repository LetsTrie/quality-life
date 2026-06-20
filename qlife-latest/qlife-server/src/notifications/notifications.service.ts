import { Injectable } from '@nestjs/common';
import type { NotificationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly realtime: RealtimeService,
  ) {}

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

  async upsertDeviceToken(accountId: string, token: string, platform: 'ANDROID') {
    await this.prisma.deviceToken.upsert({
      where: { token },
      create: { accountId, token, platform },
      update: { accountId, platform },
    });
  }

  /// Removes a device token on logout. Scoped to the caller's account so a user
  /// can only delete a token bound to their own account.
  async removeDeviceToken(accountId: string, token: string) {
    await this.prisma.deviceToken.deleteMany({ where: { token, accountId } });
  }

  async createInAppNotification(args: {
    recipientAccountId: string;
    senderAccountId?: string | null;
    type: NotificationType;
    title: string;
    body: string;
    appointmentId?: string;
    assessmentId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientAccountId: args.recipientAccountId,
        senderAccountId: args.senderAccountId ?? null,
        type: args.type,
        channel: 'IN_APP',
        title: args.title,
        body: args.body,
        appointmentId: args.appointmentId,
        assessmentId: args.assessmentId,
      },
    });

    try {
      const data: Record<string, string> = {
        notificationId: notification.id,
        type: args.type,
      };
      if (args.appointmentId) data.appointmentId = args.appointmentId;
      if (args.assessmentId) data.assessmentId = args.assessmentId;

      await this.push.sendToAccount({
        accountId: args.recipientAccountId,
        title: args.title,
        body: args.body,
        data,
      });
    } catch (_) {}

    // Realtime fanout to the recipient's authenticated sockets (no-op if no
    // socket server is attached yet). Same single chokepoint as push.
    try {
      this.realtime.emitToAccount(args.recipientAccountId, 'notification', {
        notificationId: notification.id,
        type: args.type,
        title: args.title,
        body: args.body,
        appointmentId: args.appointmentId ?? null,
        assessmentId: args.assessmentId ?? null,
        createdAt: notification.createdAt,
      });
    } catch (_) {}

    return notification;
  }

  async sendPush(args: {
    accountId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      await this.push.sendToAccount(args);
    } catch (_) {}
  }
}
