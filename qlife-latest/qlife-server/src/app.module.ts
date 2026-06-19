import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AccountsModule } from './accounts/accounts.module';
import { AdminModule } from './admin/admin.module';
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
import { SpecializationsModule } from './specializations/specializations.module';
import { SupportModule } from './support/support.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Global rate limit: 120 requests per minute per IP.
    // Tighten per-endpoint with @Throttle() where needed.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
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
    SpecializationsModule,
    SupportModule,
    ContentModule,
    ClientsModule,
    UsersModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

