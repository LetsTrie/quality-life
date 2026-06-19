import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { MarkViewedDto } from './dto/mark-viewed.dto';
import { RateContentDto } from './dto/rate-content.dto';
import { ContentService } from './content.service';

@Controller('/v1/content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Roles('USER')
  async list(@Req() req: Request) {
    return { data: { content: await this.content.list(req.auth!.account.id) } };
  }

  @Get('tips')
  async tips(@Query('type') type?: string) {
    const tipType = type === 'professional' ? 'professional' : 'user';
    return { data: { tips: this.content.getTips(tipType) } };
  }

  @Post('/:contentKey/viewed')
  @Roles('USER')
  async viewed(@Req() req: Request, @Param('contentKey') contentKey: string, @Body() body: MarkViewedDto) {
    await this.content.markViewed({
      accountId: req.auth!.account.id,
      contentKey,
      completed: body.completed,
    });
    return { data: {} };
  }

  @Post('/:contentKey/rating')
  @Roles('USER')
  async rating(@Req() req: Request, @Param('contentKey') contentKey: string, @Body() body: RateContentDto) {
    await this.content.rate({
      accountId: req.auth!.account.id,
      contentKey,
      rating: body.rating,
      comment: body.comment,
    });
    return { data: {} };
  }
}

