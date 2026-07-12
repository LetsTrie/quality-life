import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { InstrumentsModule } from '../instruments/instruments.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, AccountsModule, AuthModule, InstrumentsModule],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminService],
})
export class AdminModule {}
