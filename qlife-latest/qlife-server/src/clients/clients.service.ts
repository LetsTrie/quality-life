import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProfessional(args: { accountId: string; page: number }) {
    const professional = await this.prisma.professionalProfile.findUnique({
      where: { accountId: args.accountId },
    });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const take = 20;
    const skip = Math.max(0, (args.page - 1) * take);

    const [total, clients] = await Promise.all([
      this.prisma.careRelationship.count({ where: { professionalProfileId: professional.id, status: 'ACTIVE' } }),
      this.prisma.careRelationship.findMany({
        where: { professionalProfileId: professional.id, status: 'ACTIVE' },
        orderBy: [{ establishedAt: 'desc' }],
        skip,
        take,
        include: {
          user: { select: { id: true, displayName: true, phone: true, districtId: true } },
        },
      }),
    ]);

    return { clients, pagination: { page: args.page, pageSize: take, total, hasMore: skip + clients.length < total } };
  }

  async getByIdForProfessional(args: { accountId: string; careRelationshipId: string }) {
    const professional = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professional) throw new BadRequestException('Professional profile missing');
    const rel = await this.prisma.careRelationship.findFirst({
      where: { id: args.careRelationshipId, professionalProfileId: professional.id, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, displayName: true, phone: true, gender: true, dateOfBirth: true, districtId: true } },
      },
    });
    if (!rel) throw new NotFoundException('Client not found');
    return rel;
  }

  /// A client's assessments visible to their clinician: ones this professional
  /// assigned PLUS the client's own self-initiated screens (the active care
  /// relationship is the consent boundary — mirrors legacy ClientProfile).
  async listClientAssessments(args: { accountId: string; careRelationshipId: string; page: number }) {
    const professional = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const rel = await this.prisma.careRelationship.findFirst({
      where: { id: args.careRelationshipId, professionalProfileId: professional.id, status: 'ACTIVE' },
      select: { userProfileId: true },
    });
    if (!rel) throw new NotFoundException('Client not found');

    const take = 20;
    const skip = Math.max(0, (args.page - 1) * take);

    const where = {
      subjectUserProfileId: rel.userProfileId,
      OR: [{ assignedByProfessionalId: professional.id }, { source: 'SELF_INITIATED' as const }],
    };
    const [total, assessments] = await Promise.all([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          status: true,
          source: true,
          severityLabel: true,
          rawScore: true,
          completedAt: true,
          dueAt: true,
          instrumentVersion: { select: { instrument: { select: { slug: true, name: true, nameBn: true, category: true } } } },
        },
      }),
    ]);

    return { assessments, pagination: { page: args.page, pageSize: take, total, hasMore: skip + assessments.length < total } };
  }
}
