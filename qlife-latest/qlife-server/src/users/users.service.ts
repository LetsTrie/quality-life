import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

function ageFromDob(dob: Date, now = new Date()) {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(accountId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { accountId },
    });
    if (!profile) throw new NotFoundException('User profile not found');
    return profile;
  }

  async updateMe(accountId: string, dto: any) {
    const profile = await this.prisma.userProfile.findUnique({ where: { accountId } });
    if (!profile) throw new NotFoundException('User profile not found');

    let dateOfBirth = undefined as Date | undefined;
    if (dto.dateOfBirth != null) {
      const parsed = new Date(dto.dateOfBirth);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid dateOfBirth');
      }
      const age = ageFromDob(parsed);
      if (!Number.isFinite(age) || age < 5 || age > 150) {
        throw new BadRequestException('Invalid dateOfBirth');
      }
      dateOfBirth = parsed;
    }

    // Location normalization: allow sending unionId OR upazilaId OR districtId.
    // If unionId is provided, infer upazilaId + districtId from the DB.
    // If upazilaId is provided, infer districtId and clear unionId.
    // If districtId is provided, clear deeper fields.
    let districtId = undefined as string | undefined | null;
    let upazilaId = undefined as string | undefined | null;
    let unionId = undefined as string | undefined | null;

    if (dto.unionId) {
      const u = await this.prisma.union.findUnique({
        where: { id: dto.unionId },
        select: { id: true, upazilaId: true, upazila: { select: { districtId: true } } },
      });
      if (!u) throw new BadRequestException('Invalid unionId');
      unionId = u.id;
      upazilaId = u.upazilaId;
      districtId = u.upazila.districtId;
    } else if (dto.upazilaId) {
      const up = await this.prisma.upazila.findUnique({
        where: { id: dto.upazilaId },
        select: { id: true, districtId: true },
      });
      if (!up) throw new BadRequestException('Invalid upazilaId');
      unionId = null;
      upazilaId = up.id;
      districtId = up.districtId;
    } else if (dto.districtId) {
      const d = await this.prisma.district.findUnique({
        where: { id: dto.districtId },
        select: { id: true },
      });
      if (!d) throw new BadRequestException('Invalid districtId');
      unionId = null;
      upazilaId = null;
      districtId = d.id;
    }

    // Onboarding guideline / privacy consent (legacy StartingGuideline). Once
    // accepted we stamp it; it is never cleared back to null here.
    const consentAcceptedAt = dto.consentAccepted === true && !profile.consentAcceptedAt ? new Date() : undefined;

    return this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        displayName: dto.displayName ?? undefined,
        dateOfBirth,
        gender: dto.gender ?? undefined,
        marital: dto.marital ?? undefined,
        phone: dto.phone ?? undefined,
        districtId,
        upazilaId,
        unionId,
        consentAcceptedAt,
      },
    });
  }

  isProfileComplete(profile: {
    displayName: string | null;
    dateOfBirth: Date | null;
    gender: any;
    marital: any;
    districtId?: string | null;
  }) {
    return Boolean(profile.displayName && profile.dateOfBirth && profile.gender && profile.marital && profile.districtId);
  }

  hasAcceptedConsent(profile: { consentAcceptedAt?: Date | null }) {
    return Boolean(profile.consentAcceptedAt);
  }

  hasCompletedIntroScreening(profile: { introScreeningCompletedAt?: Date | null }) {
    return Boolean(profile.introScreeningCompletedAt);
  }
}

