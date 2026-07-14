import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { InvitationsService } from './invitations.service';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get(':token')
  lookup(@Param('token') token: string) {
    return this.invitations.lookup(token);
  }

  @Post(':token/accept')
  @UseGuards(ClerkAuthGuard)
  accept(@Param('token') token: string, @CurrentUser() authUser: Authed) {
    return this.invitations.accept(token, authUser.user.id);
  }
}
