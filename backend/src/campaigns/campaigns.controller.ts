import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { CampaignsService } from './campaigns.service';
import { ReviewCampaignDto } from './dto/review-campaign.dto';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('campaigns')
@UseGuards(ClerkAuthGuard)
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewCampaignDto,
    @CurrentUser() authUser: Authed,
  ) {
    return this.campaigns.review(id, dto, authUser);
  }
}
