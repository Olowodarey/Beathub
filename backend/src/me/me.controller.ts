import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { CreatorApplicationsService } from '../creator-applications/creator-applications.service';
import { SubmitApplicationDto } from '../creator-applications/dto/submit-application.dto';
import { CreatePlaylistDto } from '../playlists/dto/create-playlist.dto';
import { PlaylistsService } from '../playlists/playlists.service';
import { PrismaService } from '../prisma/prisma.service';
import { mapMembership, mapTeam, mapUser } from '../common/mappers';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('me')
@UseGuards(ClerkAuthGuard)
export class MeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creatorApplications: CreatorApplicationsService,
    private readonly playlists: PlaylistsService,
  ) {}

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

  @Get('creator-application')
  getMyApplication(@CurrentUser() authUser: Authed) {
    return this.creatorApplications.mine(authUser.user.id);
  }

  @Post('creator-application')
  submitApplication(
    @CurrentUser() authUser: Authed,
    @Body() dto: SubmitApplicationDto,
  ) {
    return this.creatorApplications.submit(authUser.user.id, dto.message);
  }

  @Get('playlists')
  listPlaylists(@CurrentUser() authUser: Authed) {
    return this.playlists.listMine(authUser.user.id);
  }

  @Post('playlists')
  createPlaylist(
    @CurrentUser() authUser: Authed,
    @Body() dto: CreatePlaylistDto,
  ) {
    return this.playlists.create(authUser.user.id, dto.name);
  }
}
