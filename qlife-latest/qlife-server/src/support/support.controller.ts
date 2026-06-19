import { Controller, Get, Query } from '@nestjs/common';

import { SupportService } from './support.service';

@Controller('/v1/support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('hotlines')
  async hotlines(@Query('slug') slug?: string) {
    const hotlines = await this.support.listHotlines(slug);
    return { data: { hotlines } };
  }
}
