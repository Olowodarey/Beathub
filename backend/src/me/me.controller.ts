import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { mapMembership, mapTeam, mapUser } from '../common/mappers';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('me')
@UseGuards(ClerkAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get(@CurrentUser() authUser: Authed) {
    const teams = await this.prisma.team.findMany({
      where: { id: { in: authUser.memberships.map((m) => m.teamId) } },
    });
    return {
      user: mapUser(authUser.user),
      memberships: authUser.memberships.map(mapMembership),
      teams: teams.map(mapTeam),
    };
  }
}
