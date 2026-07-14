import { Global, Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  providers: [ClerkService, ClerkAuthGuard, RolesGuard],
  exports: [ClerkService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
