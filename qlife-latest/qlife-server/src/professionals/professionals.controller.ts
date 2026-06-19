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

  // Reference list of valid profession types (used to populate registration dropdowns).
  @Get('/profession-types')
  @Public()
  professionTypes() {
    return {
      data: {
        professionTypes: [
          { value: 'CLINICAL_PSYCHOLOGIST', labelEn: 'Clinical psychologist', labelBn: 'ক্লিনিক্যাল সাইকোলজিস্ট' },
          { value: 'ASSISTANT_CLINICAL_PSYCHOLOGIST', labelEn: 'Assistant clinical psychologist', labelBn: 'সহকারী ক্লিনিক্যাল সাইকোলজিস্ট' },
          { value: 'PSYCHIATRIST', labelEn: 'Psychiatrist', labelBn: 'মনোরোগ বিশেষজ্ঞ' },
          { value: 'COUNSELOR', labelEn: 'Counselor', labelBn: 'কাউন্সেলর' },
          { value: 'OTHER', labelEn: 'Other', labelBn: 'অন্যান্য' },
        ],
      },
    };
  }

  // User converts their account into a professional account (step 1).
  @Post('/register')
  @Roles('USER')
  async register(@Req() req: Request, @Body() body: RegisterProfessionalDto) {
    const result = await this.professionals.registerAsProfessional(req.auth!.account.id, body);
    return { data: result };
  }

  // Professional directory (user-side browsing) with optional filters.
  @Get()
  @Roles('USER')
  async directory(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('q') q?: string,
    @Query('professionType') professionType?: string,
    @Query('districtId') districtId?: string,
    @Query('specialization') specialization?: string,
  ) {
    const result = await this.professionals.listDirectory({
      page: page && page > 0 ? page : 1,
      q: q?.trim() || undefined,
      professionType: professionType || undefined,
      districtId: districtId || undefined,
      specializationSlug: specialization || undefined,
    });
    return { data: result };
  }

  // Professional views their own profile.
  @Get('/me')
  @Roles('PROFESSIONAL')
  async me(@Req() req: Request) {
    return { data: { professional: await this.professionals.myProfessionalProfile(req.auth!.account.id) } };
  }

  // Public-facing professional detail (user browses before booking).
  @Get('/:id')
  @Roles('USER')
  async detail(@Param('id') id: string) {
    return { data: { professional: await this.professionals.getPublicProfile(id) } };
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

