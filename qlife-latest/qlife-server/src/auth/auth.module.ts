import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';
import { AdminTokenService } from './admin-token.service';
import { AuthContextResolver } from './auth-context-resolver';
import { AuthGuard } from './auth.guard';
import { UserAuthController } from './user-auth.controller';
import { WorkosJwtService } from './workos-jwt.service';
import { WorkosService } from './workos.service';

@Module({
  imports: [AccountsModule],
  controllers: [UserAuthController],
  providers: [
    WorkosJwtService,
    WorkosService,
    AdminTokenService,
    AuthContextResolver,
    AuthGuard,
  ],
  exports: [WorkosJwtService, WorkosService, AdminTokenService, AuthContextResolver, AuthGuard],
})
export class AuthModule {}
