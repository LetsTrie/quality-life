import { Controller, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InstrumentsService } from './instruments.service';

@Controller('/v1/instruments')
export class InstrumentsController {
  constructor(private readonly instruments: InstrumentsService) {}

  @Get()
  async list(@Req() req: Request) {
    // Users only see self-assessable scales; professionals see only the clinical
    // scales they may assign (GHQ/PSS/anxiety/well-being + the risk-profile
    // screens are user-facing defaults, not assignable); admins see all.
    const role = req.auth?.account.role;
    const selfAssessableOnly = role === 'USER';
    const professionalAssignableOnly = role === 'PROFESSIONAL';
    return {
      data: {
        instruments: await this.instruments.list({ selfAssessableOnly, professionalAssignableOnly }),
      },
    };
  }

  @Get(':slug')
  async bySlug(@Param('slug') slug: string) {
    const result = await this.instruments.getPublishedVersionBySlug(slug);
    return { data: result };
  }
}

