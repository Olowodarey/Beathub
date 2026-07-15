import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationStatus, ContentStatus, InvitationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { ContentService } from '../content/content.service';
import { CreateContentDto } from '../content/dto/create-content.dto';
import { CreatorApplicationsService } from '../creator-applications/creator-applications.service';
import { DecideApplicationDto } from '../creator-applications/dto/decide-application.dto';
import { DecideLabelApplicationDto } from '../labels/dto/decide-label-application.dto';
import { LabelsService } from '../labels/labels.service';
import { InvitationsService } from '../invitations/invitations.service';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { TeamsService } from './teams.service';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('teams/:teamId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly invitations: InvitationsService,
    private readonly dashboard: DashboardService,
    private readonly analytics: AnalyticsService,
    private readonly content: ContentService,
    private readonly creatorApplications: CreatorApplicationsService,
    private readonly labels: LabelsService,
  ) {}

  @Get('dashboard')
  @Roles()
  getDashboard(
    @Param('teamId') teamId: string,
    @CurrentUser() authUser: Authed,
  ) {
    return this.dashboard.getDashboard(teamId, authUser.user.id);
  }

  @Get('analytics')
  @Roles()
  getAnalytics(@Param('teamId') teamId: string) {
    return this.analytics.getAnalytics(teamId);
  }

  @Get('users')
  @Roles()
  listUsers(@Param('teamId') teamId: string) {
    return this.teams.listUsers(teamId);
  }

  @Get('invitations')
  @Roles('OWNER', 'ADMIN')
  listInvitations(
    @Param('teamId') teamId: string,
    @Query('status') status?: InvitationStatus,
  ) {
    return this.invitations.list(teamId, status);
  }

  @Post('invitations')
  @Roles('OWNER', 'ADMIN')
  createInvitation(
    @Param('teamId') teamId: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitations.create(teamId, authUser.user.id, dto);
  }

  @Delete('invitations/:id')
  @HttpCode(204)
  @Roles('OWNER', 'ADMIN')
  revokeInvitation(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ) {
    return this.invitations.revoke(teamId, id);
  }

  @Get('content')
  @Roles()
  listContent(
    @Param('teamId') teamId: string,
    @Query('status') status?: ContentStatus,
  ) {
    return this.teams.listContent(teamId, status);
  }

  @Post('content')
  @Roles()
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 25 * 1024 * 1024 } }))
  uploadContent(
    @Param('teamId') teamId: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const membership = authUser.memberships.find((m) => m.teamId === teamId)!;
    if (membership.role === 'MEMBER' && membership.personaType === 'LISTENER') {
      throw new ForbiddenException(
        'Listeners cannot upload. Apply to become a creator first.',
      );
    }
    return this.content.uploadForTeam(teamId, authUser.user.id, dto, file);
  }

  @Get('library')
  @Roles()
  listLibrary(@Param('teamId') teamId: string) {
    return this.content.listLibrary(teamId);
  }

  @Get('campaigns')
  @Roles()
  listCampaigns(
    @Param('teamId') teamId: string,
    @CurrentUser() authUser: Authed,
  ) {
    const membership = authUser.memberships.find((m) => m.teamId === teamId)!;
    return this.teams.listCampaigns(teamId, {
      userId: authUser.user.id,
      role: membership.role,
    });
  }

  @Get('invoices')
  @Roles('OWNER')
  listInvoices(@Param('teamId') teamId: string) {
    return this.teams.listInvoices(teamId);
  }

  @Get('creator-applications')
  @Roles('OWNER', 'ADMIN')
  listCreatorApplications(
    @Param('teamId') teamId: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.creatorApplications.listForTeam(teamId, status);
  }

  @Post('creator-applications/:id/decision')
  @Roles('OWNER', 'ADMIN')
  decideCreatorApplication(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: DecideApplicationDto,
  ) {
    return this.creatorApplications.decide(
      teamId,
      id,
      authUser.user.id,
      dto.status,
      dto.reviewerNote,
    );
  }

  @Get('label-applications')
  @Roles('OWNER', 'ADMIN')
  listLabelApplications(
    @Param('teamId') teamId: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.labels.listApplicationsForTeam(teamId, status);
  }

  @Post('label-applications/:id/decision')
  @Roles('OWNER', 'ADMIN')
  decideLabelApplication(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: DecideLabelApplicationDto,
  ) {
    return this.labels.decideApplication(
      teamId,
      id,
      authUser.user.id,
      dto.status,
      dto.reviewerNote,
    );
  }

  @Post('campaigns')
  @Roles()
  createCampaign(
    @Param('teamId') teamId: string,
    @CurrentUser() authUser: Authed,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.teams.createCampaign(teamId, authUser.user.id, dto);
  }
}
