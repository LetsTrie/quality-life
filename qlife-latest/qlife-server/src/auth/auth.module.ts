import { Module } from '@nestjs/common';

import { AccountsModule } from '../accounts/accounts.module';
import { AuthGuard } from './auth.guard';
import { CognitoJwtService } from './cognito-jwt.service';

@Module({
  imports: [AccountsModule],
  providers: [CognitoJwtService, AuthGuard],
  exports: [CognitoJwtService, AuthGuard],
})
export class AuthModule {}

