import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { InvitationsService } from './invitations.service';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('invitations')
@UseGuards(ClerkAuthGuard)
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post(':token/accept')
  accept(@Param('token') token: string, @CurrentUser() authUser: Authed) {
    return this.invitations.accept(token, authUser.user.id);
  }
}
