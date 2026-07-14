import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { CreatorApplicationsModule } from '../creator-applications/creator-applications.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [InvitationsModule, ContentModule, CreatorApplicationsModule],
  controllers: [TeamsController],
  providers: [TeamsService, DashboardService, AnalyticsService],
})
export class TeamsModule {}
