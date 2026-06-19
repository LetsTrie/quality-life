import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';
import { AdminTokenService } from './admin-token.service';
import { AuthGuard } from './auth.guard';
import { CognitoJwtService } from './cognito-jwt.service';

@Module({
  imports: [AccountsModule],
  providers: [CognitoJwtService, AdminTokenService, AuthGuard],
  exports: [CognitoJwtService, AdminTokenService, AuthGuard],
})
export class AuthModule {}

