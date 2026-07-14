import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapCampaign } from '../common/mappers';
import { requireTeamRole } from '../common/auth-helpers';
import type { AuthedRequest } from '../auth/request-user.type';
import { ReviewCampaignDto } from './dto/review-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async review(
    id: string,
    dto: ReviewCampaignDto,
    authUser: NonNullable<AuthedRequest['authUser']>,
  ) {
    const existing = await this.prisma.adCampaign.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Campaign not found');

    requireTeamRole(authUser, existing.teamId, ['OWNER', 'ADMIN']);

    const updated = await this.prisma.adCampaign.update({
      where: { id },
      data: {
        status: dto.status,
        reviewerId: authUser.user.id,
        reviewerNote: dto.reviewerNote ?? null,
      },
      include: { requester: true },
    });
    return mapCampaign(updated);
  }
}
