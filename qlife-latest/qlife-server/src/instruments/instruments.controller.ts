import { Controller, Get, Param } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';

@Controller('/v1/instruments')
export class InstrumentsController {
  constructor(private readonly instruments: InstrumentsService) {}

  @Get()
  async list() {
    return { data: { instruments: await this.instruments.list() } };
  }

  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    const result = await this.instruments.getPublishedVersionBySlug(slug);
    return { data: result };
  }
}

