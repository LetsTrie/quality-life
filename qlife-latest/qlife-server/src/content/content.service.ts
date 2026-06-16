import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.educationalContent.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        contentKey: true,
        type: true,
        provider: true,
        providerRef: true,
        title: true,
        description: true,
        locale: true,
        durationSeconds: true,
        thumbnailUrl: true,
        displayOrder: true,
      },
    });
    return items;
  }

  async markViewed(args: { accountId: string; contentKey: string; completed?: boolean }) {
    const account = await this.prisma.account.findUnique({ where: { id: args.accountId } });
    if (!account) throw new NotFoundException('Account not found');

    const content = await this.prisma.educationalContent.findUnique({
      where: { contentKey: args.contentKey },
    });
    if (!content) throw new NotFoundException('Content not found');

    const existing = await this.prisma.contentView.findUnique({
      where: { accountId_contentId: { accountId: account.id, contentId: content.id } },
    });

    if (!existing) {
      await this.prisma.contentView.create({
        data: {
          accountId: account.id,
          contentId: content.id,
          viewCount: 1,
          completed: args.completed ?? false,
        },
      });
      return;
    }

    await this.prisma.contentView.update({
      where: { id: existing.id },
      data: {
        viewCount: { increment: 1 },
        completed: args.completed ?? existing.completed,
        lastViewedAt: new Date(),
      },
    });
  }

  async rate(args: { accountId: string; contentKey: string; rating: number; comment?: string }) {
    const content = await this.prisma.educationalContent.findUnique({
      where: { contentKey: args.contentKey },
    });
    if (!content) throw new NotFoundException('Content not found');

    if (args.rating < 1 || args.rating > 5) throw new BadRequestException('Invalid rating');

    await this.prisma.contentRating.upsert({
      where: { accountId_contentId: { accountId: args.accountId, contentId: content.id } },
      update: {
        rating: args.rating,
        comment: args.comment ?? null,
      },
      create: {
        accountId: args.accountId,
        contentId: content.id,
        rating: args.rating,
        comment: args.comment ?? null,
      },
    });
  }
}

