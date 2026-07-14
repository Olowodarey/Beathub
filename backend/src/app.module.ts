import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ContentModule } from './content/content.module';
import { InvitationsModule } from './invitations/invitations.module';
import { PrismaModule } from './prisma/prisma.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TeamsModule,
    InvitationsModule,
    ContentModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
