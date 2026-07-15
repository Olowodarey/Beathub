import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { AddMemberDto } from './dto/add-member.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { RenamePlaylistDto } from './dto/rename-playlist.dto';
import { PlaylistsService } from './playlists.service';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private readonly playlists: PlaylistsService) {}

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() authUser: Authed) {
    return this.playlists.getDetail(id, authUser.user.id);
  }

  @Patch(':id')
  rename(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: RenamePlaylistDto,
  ) {
    return this.playlists.rename(id, authUser.user.id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() authUser: Authed) {
    return this.playlists.remove(id, authUser.user.id);
  }

  @Post(':id/tracks')
  addTrack(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: AddTrackDto,
  ) {
    return this.playlists.addTrack(id, authUser.user.id, dto.contentId);
  }

  @Delete(':id/tracks/:entryId')
  @HttpCode(204)
  removeTrack(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.removeTrack(id, authUser.user.id, entryId);
  }

  @Post(':id/invites')
  createInvite(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: AddMemberDto,
  ) {
    return this.playlists.inviteByEmail(id, authUser.user.id, dto.email);
  }

  @Get(':id/invites')
  listPendingInvites(
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.listPendingInvitesForPlaylist(id, authUser.user.id);
  }

  @Delete(':id/invites/:inviteId')
  @HttpCode(204)
  revokeInvite(
    @Param('id') id: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.revokeInvite(id, authUser.user.id, inviteId);
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.playlists.removeMember(id, authUser.user.id, memberUserId);
  }
}
