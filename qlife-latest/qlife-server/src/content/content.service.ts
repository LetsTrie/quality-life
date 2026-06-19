import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const TIPS: Record<'user' | 'professional', Array<{ en: string; bn: string }>> = {
  user: [
    { en: 'Take three slow breaths before your next task — it helps settle the mind.', bn: 'পরের কাজের আগে তিনটি ধীরে শ্বাস নিন — এটি মনকে স্থির করতে সাহায্য করে।' },
    { en: 'Naming a feeling makes it easier to hold. What are you feeling right now?', bn: 'একটি অনুভূতির নাম দিলে তা বহন করা সহজ হয়। এই মুহূর্তে আপনি কেমন অনুভব করছেন?' },
    { en: 'Small steps count. One kind act toward yourself today is enough.', bn: 'ছোট পদক্ষেপও গুরুত্বপূর্ণ। আজ নিজের প্রতি একটি সদয় কাজই যথেষ্ট।' },
    { en: 'Rest is productive too. Give yourself permission to pause.', bn: 'বিশ্রামও উৎপাদনশীল। নিজেকে বিরতির অনুমতি দিন।' },
  ],
  professional: [
    { en: 'Reply to pending requests early — a timely response reassures clients.', bn: 'অমীমাংসিত অনুরোধে দ্রুত সাড়া দিন — সময়মতো সাড়া দেওয়া ক্লায়েন্টদের আশ্বস্ত করে।' },
    { en: 'A short check-in between sessions can help a client feel supported.', bn: 'সেশনের মাঝে ছোট খোঁজখবর একজন ক্লায়েন্টকে সহযোগিতা অনুভব করাতে পারে।' },
    { en: 'Assign a follow-up self-check to track a client\'s progress over time.', bn: 'সময়ের সাথে অগ্রগতি ট্র্যাক করতে একটি ফলো-আপ স্ব-পরীক্ষা নির্ধারণ করুন।' },
  ],
};

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(accountId?: string) {
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
        // The caller's own view state, so the catalog can show watched/in-progress.
        views: accountId
          ? { where: { accountId }, select: { completed: true, viewCount: true }, take: 1 }
          : false,
      },
    });

    // Flatten the per-user view row into top-level flags.
    return items.map((item) => {
      const { views, ...rest } = item as typeof item & {
        views?: Array<{ completed: boolean; viewCount: number }>;
      };
      const view = Array.isArray(views) ? views[0] : undefined;
      return { ...rest, watched: view?.completed ?? false, viewCount: view?.viewCount ?? 0 };
    });
  }

  getTips(type: 'user' | 'professional') {
    return TIPS[type] ?? TIPS.user;
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

