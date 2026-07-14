import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { mapCampaign, mapContent, mapMembership, mapUser } from '../common/mappers';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(teamId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { teamId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return memberships.map((m) => ({
      membership: mapMembership(m),
      user: mapUser(m.user),
    }));
  }

  async listContent(teamId: string, status?: ContentStatus) {
    const items = await this.prisma.content.findMany({
      where: { teamId, ...(status && { status }) },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapContent);
  }

  async listCampaigns(
    teamId: string,
    viewer: { userId: string; role: Role },
  ) {
    const where: Prisma.AdCampaignWhereInput = { teamId };
    if (viewer.role === 'MEMBER') where.requesterId = viewer.userId;
    const items = await this.prisma.adCampaign.findMany({
      where,
      include: { requester: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapCampaign);
  }

  async createCampaign(
    teamId: string,
    requesterId: string,
    dto: CreateCampaignDto,
  ) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new Error('endDate must be on or after startDate');
    }
    const created = await this.prisma.adCampaign.create({
      data: {
        teamId,
        requesterId,
        slotType: dto.slotType,
        budgetUsd: dto.budgetUsd,
        startDate: start,
        endDate: end,
      },
      include: { requester: true },
    });
    return mapCampaign(created);
  }
}
