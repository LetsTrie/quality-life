import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AssignAssessmentDto } from './dto/assign-assessment.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { AssessmentsService } from './assessments.service';
import { Roles } from '../auth/roles.decorator';

@Controller('/v1/assessments')
export class AssessmentsController {
  constructor(private readonly assessments: AssessmentsService) {}

  @Get()
  async list(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    const role = req.auth!.account.role;
    if (role !== 'USER' && role !== 'PROFESSIONAL') return { data: { assessments: [] } };
    const result = await this.assessments.listForAccount({
      accountId: req.auth!.account.id,
      role,
      status,
      page: page ?? 1,
    });
    return { data: result };
  }

  @Get('/:id')
  async get(@Req() req: Request, @Param('id') id: string) {
    const role = req.auth!.account.role;
    if (role !== 'USER' && role !== 'PROFESSIONAL') throw new NotFoundException('Assessment not found');
    const assessment = await this.assessments.getById({ accountId: req.auth!.account.id, role, assessmentId: id });
    return { data: { assessment } };
  }

  @Post('/assign/:careRelationshipId')
  @Roles('PROFESSIONAL')
  async assign(
    @Req() req: Request,
    @Param('careRelationshipId') careRelationshipId: string,
    @Body() body: AssignAssessmentDto,
  ) {
    const assessments = await this.assessments.assignToClient({
      professionalAccountId: req.auth!.account.id,
      careRelationshipId,
      instrumentSlugs: body.instrumentSlugs,
      dueAt: body.dueAt,
    });
    return { data: { assessments } };
  }

  @Post()
  async create(@Req() req: Request, @Body() body: CreateAssessmentDto) {
    const accountId = req.auth!.account.id;
    const assessment = await this.assessments.createSelfAssessment({
      accountId,
      instrumentSlug: body.instrumentSlug,
    });
    return { data: { assessment } };
  }

  @Post(':id/answers')
  async submit(@Req() req: Request, @Param('id') id: string, @Body() body: SubmitAnswersDto) {
    const accountId = req.auth!.account.id;
    return {
      data: await this.assessments.submitAnswers({
        accountId,
        assessmentId: id,
        answers: body.answers,
      }),
    };
  }
}
