import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Roles } from '../auth/roles.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';

@Controller('/v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('/me')
  @Roles('USER')
  async me(@Req() req: Request) {
    const profile = await this.users.me(req.auth!.account.id);
    return {
      data: {
        user: profile,
        isProfileComplete: this.users.isProfileComplete(profile),
        hasAcceptedConsent: this.users.hasAcceptedConsent(profile),
        hasCompletedIntroScreening: this.users.hasCompletedIntroScreening(profile),
      },
    };
  }

  @Patch('/me')
  @Roles('USER')
  async update(@Req() req: Request, @Body() body: UpdateUserProfileDto) {
    const profile = await this.users.updateMe(req.auth!.account.id, body);
    return {
      data: {
        user: profile,
        isProfileComplete: this.users.isProfileComplete(profile),
        hasAcceptedConsent: this.users.hasAcceptedConsent(profile),
        hasCompletedIntroScreening: this.users.hasCompletedIntroScreening(profile),
      },
    };
  }
}

