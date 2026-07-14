import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(teamId: string) {
    const since = new Date(Date.now() - WEEK_MS);
    const [totalUsers, totalCreators, activeCreators, contentUploadsThisWeek] =
      await Promise.all([
        this.prisma.membership.count({ where: { teamId } }),
        this.prisma.membership.count({
          where: { teamId, personaType: 'CREATOR' },
        }),
        this.prisma.membership.count({
          where: {
            teamId,
            personaType: 'CREATOR',
            user: { status: 'ACTIVE' },
          },
        }),
        this.prisma.content.count({
          where: { teamId, createdAt: { gte: since } },
        }),
      ]);

    return {
      stats: {
        totalUsers,
        totalCreators,
        activeCreators,
        totalRevenueUsd: 0,
        contentUploadsThisWeek,
        adRevenueUsd: 0,
        adRevenueTrendPct: 0,
      },
      recentActivity: [],
    };
  }
}
