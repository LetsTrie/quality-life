import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { AppointmentStatus, Prisma } from '@prisma/client';

import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

function parseIsoOrThrow(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid datetime');
  return d;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
  ) {}

  async listForAccount(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; page: number; status?: string }) {
    const take = 10;
    const skip = Math.max(0, (args.page - 1) * take);

    // Optional status filter. `PENDING` is a convenience bucket for the
    // professional inbox = requests awaiting a response (legacy "client requests").
    let statusWhere: Prisma.AppointmentWhereInput = {};
    if (args.status === 'PENDING') {
      statusWhere = { status: { in: ['REQUESTED', 'VIEWED'] } };
    } else if (args.status) {
      statusWhere = { status: args.status as AppointmentStatus };
    }

    if (args.role === 'USER') {
      const userProfile = await this.prisma.userProfile.findUnique({ where: { accountId: args.accountId } });
      if (!userProfile) throw new BadRequestException('User profile missing');

      const where = { userProfileId: userProfile.id, deletedAt: null, ...statusWhere };
      const [total, appointments] = await Promise.all([
        this.prisma.appointment.count({ where }),
        this.prisma.appointment.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }],
          skip,
          take,
          include: {
            professional: { select: { id: true, fullName: true, professionType: true } },
          },
        }),
      ]);
      return { appointments, pagination: { page: args.page, pageSize: take, total, hasMore: skip + appointments.length < total } };
    }

    const professionalProfile = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professionalProfile) throw new BadRequestException('Professional profile missing');

    const where = { professionalProfileId: professionalProfile.id, deletedAt: null, ...statusWhere };
    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        include: {
          user: { select: { id: true, displayName: true, phone: true } },
        },
      }),
    ]);
    return { appointments, pagination: { page: args.page, pageSize: take, total, hasMore: skip + appointments.length < total } };
  }

  async getByIdForAccount(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; appointmentId: string }) {
    if (args.role === 'USER') {
      const userProfile = await this.prisma.userProfile.findUnique({ where: { accountId: args.accountId } });
      if (!userProfile) throw new BadRequestException('User profile missing');

      const appt = await this.prisma.appointment.findFirst({
        where: { id: args.appointmentId, userProfileId: userProfile.id, deletedAt: null },
        include: {
          professional: { select: { id: true, fullName: true, professionType: true, phone: true } },
          events: { orderBy: [{ createdAt: 'asc' }] },
        },
      });
      if (!appt) throw new NotFoundException('Appointment not found');
      await this.markAppointmentNotificationsRead(appt.id, args.accountId);
      return appt;
    }

    const professionalProfile = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professionalProfile) throw new BadRequestException('Professional profile missing');

    const appt = await this.prisma.appointment.findFirst({
      where: { id: args.appointmentId, professionalProfileId: professionalProfile.id, deletedAt: null },
      include: {
        user: { select: { id: true, displayName: true, phone: true } },
        events: { orderBy: [{ createdAt: 'asc' }] },
      },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    await this.markAppointmentNotificationsRead(appt.id, args.accountId);
    return appt;
  }

  private async markAppointmentNotificationsRead(appointmentId: string, accountId: string) {
    await this.prisma.notification.updateMany({
      where: { appointmentId, recipientAccountId: accountId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async requestAppointment(args: {
    accountId: string;
    professionalProfileId: string;
    requestedStartAt: string;
    requestMessage?: string;
    profileShareGranted?: boolean;
  }) {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { accountId: args.accountId },
    });
    if (!userProfile) throw new BadRequestException('User profile missing');

    const professional = await this.prisma.professionalProfile.findUnique({
      where: { id: args.professionalProfileId },
      include: { account: true },
    });
    if (!professional) throw new NotFoundException('Professional not found');

    const existingOpen = await this.prisma.appointment.findFirst({
      where: {
        userProfileId: userProfile.id,
        professionalProfileId: professional.id,
        status: { in: ['REQUESTED', 'VIEWED', 'ACCEPTED', 'RESCHEDULE_PROPOSED'] },
      },
      select: { id: true },
    });
    if (existingOpen) {
      throw new BadRequestException('Appointment already exists');
    }

    const requestedStartAt = parseIsoOrThrow(args.requestedStartAt);

    const appointment = await this.prisma.appointment.create({
      data: {
        userProfileId: userProfile.id,
        professionalProfileId: professional.id,
        requestedStartAt,
        requestMessage: args.requestMessage ?? null,
        profileShareGranted: args.profileShareGranted ?? false,
        status: 'REQUESTED',
        events: {
          create: {
            fromStatus: null,
            toStatus: 'REQUESTED',
            actorAccountId: args.accountId,
          },
        },
      },
    });

    const requesterName = userProfile.displayName?.trim();
    await this.notifications.createInAppNotification({
      recipientAccountId: professional.accountId,
      senderAccountId: args.accountId,
      type: 'APPOINTMENT_REQUESTED',
      title: 'New appointment request',
      body: requesterName
        ? `${requesterName} would like to book a session with you. Tap to review.`
        : 'A client would like to book a session with you. Tap to review.',
      appointmentId: appointment.id,
    });

    // Best-effort email fanout.
    try {
      await this.email.sendText({
        to: professional.account.email,
        subject: 'New appointment request',
        text: `You have a new appointment request.\n\nRequested time: ${requestedStartAt.toISOString()}\n\nLog in to review.`,
      });
    } catch (_) {}

    return appointment;
  }

  async markSeenByProfessional(args: { accountId: string; appointmentId: string }) {
    const professional = await this.prisma.professionalProfile.findUnique({
      where: { accountId: args.accountId },
    });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const appt = await this.prisma.appointment.findFirst({
      where: { id: args.appointmentId, professionalProfileId: professional.id },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (appt.status !== 'REQUESTED' && appt.status !== 'VIEWED') return appt;

    const updated = await this.prisma.appointment.update({
      where: { id: appt.id },
      data: {
        status: 'VIEWED',
        viewedByProfessionalAt: appt.viewedByProfessionalAt ?? new Date(),
        events: {
          create: {
            fromStatus: appt.status,
            toStatus: 'VIEWED',
            actorAccountId: args.accountId,
          },
        },
      },
    });

    await this.prisma.notification.updateMany({
      where: {
        appointmentId: appt.id,
        type: 'APPOINTMENT_REQUESTED',
        recipientAccountId: args.accountId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return updated;
  }

  async respondByProfessional(args: {
    accountId: string;
    appointmentId: string;
    action: 'ACCEPTED' | 'DECLINED' | 'RESCHEDULE_PROPOSED';
    scheduledStartAt?: string;
    professionalMessage?: string;
    meetingLink?: string;
  }) {
    const professional = await this.prisma.professionalProfile.findUnique({
      where: { accountId: args.accountId },
    });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const appt = await this.prisma.appointment.findFirst({
      where: { id: args.appointmentId, professionalProfileId: professional.id },
      include: { user: { select: { accountId: true, id: true } } },
    });
    if (!appt) throw new NotFoundException('Appointment not found');

    if (!['REQUESTED', 'VIEWED', 'RESCHEDULE_PROPOSED'].includes(appt.status)) {
      throw new BadRequestException('Appointment not actionable');
    }

    let toStatus: AppointmentStatus;
    if (args.action === 'ACCEPTED') toStatus = 'ACCEPTED';
    else if (args.action === 'DECLINED') toStatus = 'DECLINED';
    else toStatus = 'RESCHEDULE_PROPOSED';

    const scheduledStartAt = args.scheduledStartAt ? parseIsoOrThrow(args.scheduledStartAt) : null;
    if ((toStatus === 'ACCEPTED' || toStatus === 'RESCHEDULE_PROPOSED') && !scheduledStartAt) {
      throw new BadRequestException('scheduledStartAt required');
    }

    // Create / ensure care relationship on acceptance.
    let careRelationshipId: string | null = appt.careRelationshipId ?? null;
    if (toStatus === 'ACCEPTED') {
      const existing = await this.prisma.careRelationship.findFirst({
        where: {
          userProfileId: appt.userProfileId,
          professionalProfileId: appt.professionalProfileId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      if (existing) careRelationshipId = existing.id;
      else {
        const rel = await this.prisma.careRelationship.create({
          data: {
            userProfileId: appt.userProfileId,
            professionalProfileId: appt.professionalProfileId,
            referenceCode: String(Math.floor(1000000 + Math.random() * 9000000)),
            status: 'ACTIVE',
          },
        });
        careRelationshipId = rel.id;
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appt.id },
      data: {
        status: toStatus,
        respondedAt: new Date(),
        scheduledStartAt: scheduledStartAt ?? appt.scheduledStartAt,
        professionalMessage: args.professionalMessage ?? null,
        meetingLink: args.meetingLink ?? null,
        careRelationshipId,
        events: {
          create: {
            fromStatus: appt.status,
            toStatus,
            actorAccountId: args.accountId,
            note: args.professionalMessage ?? null,
          },
        },
      },
    });

    // Notify user
    const type =
      toStatus === 'ACCEPTED'
        ? 'APPOINTMENT_ACCEPTED'
        : toStatus === 'DECLINED'
          ? 'APPOINTMENT_DECLINED'
          : 'APPOINTMENT_RESCHEDULED';

    const proName = professional.fullName?.trim() || 'Your provider';
    const notifTitle =
      type === 'APPOINTMENT_ACCEPTED' ? 'Appointment confirmed' :
      type === 'APPOINTMENT_DECLINED' ? 'Appointment update' :
      'New time proposed';
    const notifBody =
      type === 'APPOINTMENT_ACCEPTED' ? `${proName} confirmed your session. Tap to see the details.` :
      type === 'APPOINTMENT_DECLINED' ? `${proName} isn't able to take this appointment. Tap to find another time or provider.` :
      `${proName} suggested a new time for your session. Tap to confirm.`;

    await this.notifications.createInAppNotification({
      recipientAccountId: appt.user.accountId,
      senderAccountId: args.accountId,
      type,
      title: notifTitle,
      body: notifBody,
      appointmentId: appt.id,
    });

    // Best-effort email fanout to user.
    try {
      const userAccount = await this.prisma.account.findUnique({
        where: { id: appt.user.accountId },
        select: { email: true },
      });
      if (userAccount?.email) {
        await this.email.sendText({
          to: userAccount.email,
          subject: `Appointment ${type === 'APPOINTMENT_ACCEPTED' ? 'accepted' : type === 'APPOINTMENT_DECLINED' ? 'declined' : 'updated'}`,
          text: `Your appointment was updated.\n\nStatus: ${toStatus}\nScheduled: ${updated.scheduledStartAt?.toISOString() ?? ''}\nMeeting link: ${updated.meetingLink ?? ''}`,
        });
      }
    } catch (_) {}

    return updated;
  }

  /// Either party cancels. A user can cancel while the request/booking is still
  /// open or accepted; a professional can cancel an accepted/open booking.
  async cancel(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; appointmentId: string; reason?: string }) {
    const cancellableFrom: AppointmentStatus[] = ['REQUESTED', 'VIEWED', 'ACCEPTED', 'RESCHEDULE_PROPOSED'];

    if (args.role === 'USER') {
      const userProfile = await this.prisma.userProfile.findUnique({ where: { accountId: args.accountId } });
      if (!userProfile) throw new BadRequestException('User profile missing');
      const appt = await this.prisma.appointment.findFirst({
        where: { id: args.appointmentId, userProfileId: userProfile.id, deletedAt: null },
        include: { professional: { select: { accountId: true } } },
      });
      if (!appt) throw new NotFoundException('Appointment not found');
      if (!cancellableFrom.includes(appt.status)) throw new BadRequestException('Appointment not cancellable');
      return this.applyCancellation(appt, 'CANCELLED_BY_USER', args.accountId, appt.professional.accountId, args.reason);
    }

    const professionalProfile = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professionalProfile) throw new BadRequestException('Professional profile missing');
    const appt = await this.prisma.appointment.findFirst({
      where: { id: args.appointmentId, professionalProfileId: professionalProfile.id, deletedAt: null },
      include: { user: { select: { accountId: true } } },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (!cancellableFrom.includes(appt.status)) throw new BadRequestException('Appointment not cancellable');
    return this.applyCancellation(appt, 'CANCELLED_BY_PROFESSIONAL', args.accountId, appt.user.accountId, args.reason);
  }

  private async applyCancellation(
    appt: { id: string; status: AppointmentStatus },
    toStatus: 'CANCELLED_BY_USER' | 'CANCELLED_BY_PROFESSIONAL',
    actorAccountId: string,
    counterpartyAccountId: string,
    reason?: string,
  ) {
    const updated = await this.prisma.appointment.update({
      where: { id: appt.id },
      data: {
        status: toStatus,
        cancelledAt: new Date(),
        cancellationReason: reason ?? null,
        events: { create: { fromStatus: appt.status, toStatus, actorAccountId, note: reason ?? null } },
      },
    });

    await this.notifications.createInAppNotification({
      recipientAccountId: counterpartyAccountId,
      senderAccountId: actorAccountId,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment cancelled',
      body: toStatus === 'CANCELLED_BY_USER'
        ? 'A client cancelled their upcoming session. Tap to view.'
        : 'Your provider cancelled your upcoming session. Tap to rebook.',
      appointmentId: appt.id,
    });

    try {
      const account = await this.prisma.account.findUnique({ where: { id: counterpartyAccountId }, select: { email: true } });
      if (account?.email) {
        await this.email.sendText({
          to: account.email,
          subject: 'Appointment cancelled',
          text: `An appointment was cancelled.${reason ? `\n\nReason: ${reason}` : ''}`,
        });
      }
    } catch (_) {}

    return updated;
  }

  /// Professional marks an accepted appointment as completed or a no-show.
  async finalizeByProfessional(args: {
    accountId: string;
    appointmentId: string;
    outcome: 'COMPLETED' | 'NO_SHOW';
  }) {
    const professional = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const appt = await this.prisma.appointment.findFirst({
      where: { id: args.appointmentId, professionalProfileId: professional.id, deletedAt: null },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.status !== 'ACCEPTED') throw new BadRequestException('Only an accepted appointment can be finalized');

    return this.prisma.appointment.update({
      where: { id: appt.id },
      data: {
        status: args.outcome,
        completedAt: args.outcome === 'COMPLETED' ? new Date() : null,
        events: { create: { fromStatus: appt.status, toStatus: args.outcome, actorAccountId: args.accountId } },
      },
    });
  }
}

