import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentStatus, InvitationStatus } from '@prisma/client';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { InvitationsService } from '../invitations/invitations.service';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { TeamsService } from './teams.service';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('teams/:teamId')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly invitations: InvitationsService,
    private readonly dashboard: DashboardService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Get('dashboard')
  @Roles()
  getDashboard(@Param('teamId') teamId: string) {
    return this.dashboard.getDashboard(teamId);
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
