import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RegisterProfessionalDto } from './dto/register-professional.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { ProfessionalsService } from './professionals.service';

@Controller('/v1/professionals')
export class ProfessionalsController {
  constructor(private readonly professionals: ProfessionalsService) {}

  // User converts their account into a professional account (step 1).
  @Post('/register')
  @Roles('USER')
  async register(@Req() req: Request, @Body() body: RegisterProfessionalDto) {
    const result = await this.professionals.registerAsProfessional(req.auth!.account.id, body);
    return { data: result };
  }

  // Professional directory (user-side browsing)
  @Get()
  @Roles('USER')
  async directory(@Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    const result = await this.professionals.listDirectory({ page: page && page > 0 ? page : 1 });
    return { data: result };
  }

  // Professional views their own profile.
  @Get('/me')
  @Roles('PROFESSIONAL')
  async me(@Req() req: Request) {
    return { data: { professional: await this.professionals.myProfessionalProfile(req.auth!.account.id) } };
  }

  // Professional updates profile fields.
  @Patch('/me')
  @Roles('PROFESSIONAL')
  async update(@Req() req: Request, @Body() body: UpdateProfessionalDto) {
    return { data: { professional: await this.professionals.updateMyProfessionalProfile(req.auth!.account.id, body) } };
  }

  // Admin reviews a verification decision.
  @Post('/verifications/:id/review')
  @Roles('ADMIN')
  async review(@Req() req: Request, @Param('id') id: string, @Body() body: ReviewVerificationDto) {
    const v = await this.professionals.reviewVerification({
      adminAccountId: req.auth!.account.id,
      verificationId: id,
      decision: body.decision,
      decisionNote: body.decisionNote,
    });
    return { data: { verification: v } };
  }
}

