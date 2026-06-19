import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RequestAppointmentDto } from './dto/request-appointment.dto';
import { RespondAppointmentDto } from './dto/respond-appointment.dto';
import { AppointmentsService } from './appointments.service';

@Controller('/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get()
  async list(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('status') status?: string,
  ) {
    const role = req.auth!.account.role;
    if (role !== 'USER' && role !== 'PROFESSIONAL') {
      return { data: { appointments: [] } };
    }
    const result = await this.appointments.listForAccount({
      accountId: req.auth!.account.id,
      role,
      page: page ?? 1,
      status,
    });
    return { data: result };
  }

  @Get('/:id')
  async get(@Req() req: Request, @Param('id') id: string) {
    const role = req.auth!.account.role;
    if (role !== 'USER' && role !== 'PROFESSIONAL') {
      return { data: { appointment: null } };
    }
    const appointment = await this.appointments.getByIdForAccount({
      accountId: req.auth!.account.id,
      role,
      appointmentId: id,
    });
    return { data: { appointment } };
  }

  // User requests an appointment with a professional.
  @Post()
  @Roles('USER')
  async request(@Req() req: Request, @Body() body: RequestAppointmentDto) {
    const appointment = await this.appointments.requestAppointment({
      accountId: req.auth!.account.id,
      professionalProfileId: body.professionalProfileId,
      requestedStartAt: body.requestedStartAt,
      requestMessage: body.requestMessage,
      profileShareGranted: body.profileShareGranted,
    });
    return { data: { appointmentId: appointment.id } };
  }

  // Professional marks an appointment as seen.
  @Patch('/:id/seen')
  @Roles('PROFESSIONAL')
  async seen(@Req() req: Request, @Param('id') id: string) {
    const appointment = await this.appointments.markSeenByProfessional({
      accountId: req.auth!.account.id,
      appointmentId: id,
    });
    return { data: { appointment } };
  }

  // Professional responds to an appointment.
  @Post('/:id/respond')
  @Roles('PROFESSIONAL')
  async respond(@Req() req: Request, @Param('id') id: string, @Body() body: RespondAppointmentDto) {
    const appointment = await this.appointments.respondByProfessional({
      accountId: req.auth!.account.id,
      appointmentId: id,
      action: body.action,
      scheduledStartAt: body.scheduledStartAt,
      professionalMessage: body.professionalMessage,
      meetingLink: body.meetingLink,
    });
    return { data: { appointment } };
  }

  // Either party cancels an appointment.
  @Post('/:id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string, @Body() body: CancelAppointmentDto) {
    const role = req.auth!.account.role;
    if (role !== 'USER' && role !== 'PROFESSIONAL') {
      return { data: { appointment: null } };
    }
    const appointment = await this.appointments.cancel({
      accountId: req.auth!.account.id,
      role,
      appointmentId: id,
      reason: body.reason,
    });
    return { data: { appointment } };
  }

  // Professional marks an accepted appointment as completed.
  @Post('/:id/complete')
  @Roles('PROFESSIONAL')
  async complete(@Req() req: Request, @Param('id') id: string) {
    const appointment = await this.appointments.finalizeByProfessional({
      accountId: req.auth!.account.id,
      appointmentId: id,
      outcome: 'COMPLETED',
    });
    return { data: { appointment } };
  }

  // Professional marks an accepted appointment as a no-show.
  @Post('/:id/no-show')
  @Roles('PROFESSIONAL')
  async noShow(@Req() req: Request, @Param('id') id: string) {
    const appointment = await this.appointments.finalizeByProfessional({
      accountId: req.auth!.account.id,
      appointmentId: id,
      outcome: 'NO_SHOW',
    });
    return { data: { appointment } };
  }
}

