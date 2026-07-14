import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { CreatorApplicationsService } from '../creator-applications/creator-applications.service';
import { SubmitApplicationDto } from '../creator-applications/dto/submit-application.dto';
import { InviteArtistDto } from '../labels/dto/invite-artist.dto';
import { SubmitLabelApplicationDto } from '../labels/dto/submit-label-application.dto';
import { LabelsService } from '../labels/labels.service';
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
    private readonly labels: LabelsService,
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

  @Get('playlist-invites')
  listPlaylistInvites(@CurrentUser() authUser: Authed) {
    return this.playlists.listMyInvites(authUser.user.id);
  }

  @Post('playlist-invites/:id/accept')
  acceptPlaylistInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.respondToInvite(id, authUser.user.id, 'ACCEPTED');
  }

  @Post('playlist-invites/:id/decline')
  declinePlaylistInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.respondToInvite(id, authUser.user.id, 'DECLINED');
  }

  // ---- Label application (any user) ----

  @Get('label-application')
  getMyLabelApplication(@CurrentUser() authUser: Authed) {
    return this.labels.myApplication(authUser.user.id);
  }

  @Post('label-application')
  submitLabelApplication(
    @CurrentUser() authUser: Authed,
    @Body() dto: SubmitLabelApplicationDto,
  ) {
    return this.labels.submitApplication(
      authUser.user.id,
      dto.labelName,
      dto.message,
    );
  }

  // ---- Artist side: incoming label invites ----

  @Get('label-invites')
  listLabelInvites(@CurrentUser() authUser: Authed) {
    return this.labels.listMyIncomingInvites(authUser.user.id);
  }

  @Post('label-invites/:id/accept')
  acceptLabelInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.labels.respondToIncomingInvite(id, authUser.user.id, 'ACCEPTED');
  }

  @Post('label-invites/:id/decline')
  declineLabelInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.labels.respondToIncomingInvite(id, authUser.user.id, 'DECLINED');
  }

  @Post('label/leave')
  @HttpCode(204)
  leaveLabel(@CurrentUser() authUser: Authed) {
    return this.labels.leaveLabel(authUser.user.id);
  }

  // ---- Label owner side: roster, invites, stats ----

  @Get('label/stats')
  labelStats(@CurrentUser() authUser: Authed) {
    return this.labels.labelStats(authUser.user.id);
  }

  @Get('label/roster')
  labelRoster(@CurrentUser() authUser: Authed) {
    return this.labels.listRoster(authUser.user.id);
  }

  @Delete('label/roster/:artistId')
  @HttpCode(204)
  removeFromRoster(
    @Param('artistId') artistId: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.labels.removeArtistFromRoster(authUser.user.id, artistId);
  }

  @Get('label/invites')
  listLabelOutgoingInvites(@CurrentUser() authUser: Authed) {
    return this.labels.listMyOutgoingInvites(authUser.user.id);
  }

  @Post('label/invites')
  createLabelInvite(
    @CurrentUser() authUser: Authed,
    @Body() dto: InviteArtistDto,
  ) {
    return this.labels.inviteArtistByEmail(authUser.user.id, dto.email);
  }

  @Delete('label/invites/:id')
  @HttpCode(204)
  revokeLabelInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.labels.revokeOutgoingInvite(authUser.user.id, id);
  }
}
