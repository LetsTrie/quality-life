import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { ClientsService } from './clients.service';

@Controller('/v1/clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  @Roles('PROFESSIONAL')
  async list(@Req() req: Request, @Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    const result = await this.clients.listForProfessional({ accountId: req.auth!.account.id, page: page ?? 1 });
    return { data: result };
  }

  @Get('/:id')
  @Roles('PROFESSIONAL')
  async get(@Req() req: Request, @Param('id') id: string) {
    const rel = await this.clients.getByIdForProfessional({ accountId: req.auth!.account.id, careRelationshipId: id });
    return { data: { client: rel } };
  }

  // A client's assessments (assigned by this professional + the client's own
  // self-initiated screens) so the clinician can review results.
  @Get('/:id/assessments')
  @Roles('PROFESSIONAL')
  async assessments(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    const result = await this.clients.listClientAssessments({
      accountId: req.auth!.account.id,
      careRelationshipId: id,
      page: page ?? 1,
    });
    return { data: result };
  }
}
