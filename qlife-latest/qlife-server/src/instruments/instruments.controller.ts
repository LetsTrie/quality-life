import { Controller, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InstrumentsService } from './instruments.service';

@Controller('/v1/instruments')
export class InstrumentsController {
  constructor(private readonly instruments: InstrumentsService) {}

  @Get()
  async list(@Req() req: Request) {
    // Users only see self-assessable scales; professionals/admins see all so
    // they can assign the clinical (assign-only) ones to clients.
    const selfAssessableOnly = req.auth?.account.role === 'USER';
    return { data: { instruments: await this.instruments.list({ selfAssessableOnly }) } };
  }

  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    const result = await this.instruments.getPublishedVersionBySlug(slug);
    return { data: result };
  }
}

