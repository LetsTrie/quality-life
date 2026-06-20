import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsService } from './professionals.service';

@Module({
  imports: [EmailModule, NotificationsModule],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
})
export class ProfessionalsModule {}

