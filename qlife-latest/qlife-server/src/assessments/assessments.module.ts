import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { InstrumentsModule } from '../instruments/instruments.module';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';

@Module({
  imports: [InstrumentsModule, EmailModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
})
export class AssessmentsModule {}

