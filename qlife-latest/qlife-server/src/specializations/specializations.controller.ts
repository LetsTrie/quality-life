import { Controller, Get } from '@nestjs/common';

import { Roles } from '../auth/roles.decorator';
import { SpecializationsService } from './specializations.service';

@Controller('/v1/specializations')
export class SpecializationsController {
  constructor(private readonly specializations: SpecializationsService) {}

  // Reference vocabulary for professional onboarding + directory filtering.
  // Available to any authenticated role.
  @Get()
  @Roles('USER', 'PROFESSIONAL', 'ADMIN')
  async list() {
    return { data: { specializations: await this.specializations.list() } };
  }
}
