import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SpecializationsController } from './specializations.controller';
import { SpecializationsService } from './specializations.service';

@Module({
  imports: [PrismaModule],
  controllers: [SpecializationsController],
  providers: [SpecializationsService],
})
export class SpecializationsModule {}
