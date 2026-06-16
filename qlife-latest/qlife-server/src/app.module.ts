import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AccountsModule } from './accounts/accounts.module';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';
import { AssessmentsModule } from './assessments/assessments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { ContentModule } from './content/content.module';
import { HealthModule } from './health/health.module';
import { GeoModule } from './geo/geo.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    HealthModule,
    GeoModule,
    InstrumentsModule,
    AssessmentsModule,
    NotificationsModule,
    AppointmentsModule,
    ProfessionalsModule,
    ContentModule,
    ClientsModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

