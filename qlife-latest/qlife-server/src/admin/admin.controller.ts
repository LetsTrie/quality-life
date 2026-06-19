import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { AdminCreateProfessionalDto } from './dto/create-professional.dto';
import { AdminService } from './admin.service';

@Controller('/v1/admin')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('/overview')
  async overview() {
    const result = await this.admin.getOverview();
    return { data: result };
  }

  @Get('/professionals')
  async professionals(
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    const result = await this.admin.listProfessionals({
      status: status || undefined,
      page: page && page > 0 ? page : 1,
    });
    return { data: result };
  }

  @Post('/professionals')
  async createProfessional(@Req() req: Request, @Body() body: AdminCreateProfessionalDto) {
    const result = await this.admin.createProfessional(req.auth!.account.id, body);
    return { data: result };
  }

  @Get('/professionals/:id')
  async professionalDetail(@Param('id') id: string) {
    return { data: await this.admin.getProfessionalDetail(id) };
  }

  @Get('/appointments/:id')
  async appointmentDetail(@Param('id') id: string) {
    return { data: await this.admin.getAppointmentDetail(id) };
  }

  @Get('/assessments/:id')
  async assessmentDetail(@Param('id') id: string) {
    return { data: await this.admin.getAssessmentDetail(id) };
  }

  @Get('/users')
  async users(
    @Query('q') q?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    const result = await this.admin.listUsers({
      q: q || undefined,
      page: page && page > 0 ? page : 1,
    });
    return { data: result };
  }

  @Get('/users/:id')
  async userDetail(@Param('id') id: string) {
    const result = await this.admin.getUserDetail(id);
    return { data: result };
  }

  // Suspend or reactivate an account.
  @Patch('/accounts/:id/status')
  async setStatus(@Param('id') id: string, @Body() body: { status: 'ACTIVE' | 'SUSPENDED' }) {
    const result = await this.admin.setAccountStatus(id, body.status);
    return { data: result };
  }
}
