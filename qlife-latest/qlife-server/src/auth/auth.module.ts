import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';
import { AdminTokenService } from './admin-token.service';
import { AuthContextResolver } from './auth-context-resolver';
import { AuthGuard } from './auth.guard';
import { CognitoJwtService } from './cognito-jwt.service';

@Module({
  imports: [AccountsModule],
  providers: [CognitoJwtService, AdminTokenService, AuthContextResolver, AuthGuard],
  exports: [CognitoJwtService, AdminTokenService, AuthContextResolver, AuthGuard],
})
export class AuthModule {}

