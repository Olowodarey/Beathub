import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Per-stream rate paid out to creators. Rough market average for major
// streaming services (Spotify, Apple Music) is $0.003–$0.005 per stream.
export const REVENUE_PER_PLAY_USD = 0.004;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(teamId: string, viewerUserId: string) {
    const since = new Date(Date.now() - WEEK_MS);
    const [
      totalUsers,
      totalCreators,
      activeCreators,
      contentUploadsThisWeek,
      teamPlays,
      viewerPlays,
      viewerUploads,
    ] = await Promise.all([
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
      this.prisma.content.aggregate({
        _sum: { playCount: true },
        where: { teamId, status: 'APPROVED' },
      }),
      this.prisma.content.aggregate({
        _sum: { playCount: true },
        where: { teamId, uploaderId: viewerUserId, status: 'APPROVED' },
      }),
      this.prisma.content.count({
        where: { teamId, uploaderId: viewerUserId },
      }),
    ]);

    const totalPlays = teamPlays._sum.playCount ?? 0;
    const creatorPlays = viewerPlays._sum.playCount ?? 0;

    return {
      stats: {
        totalUsers,
        totalCreators,
        activeCreators,
        totalPlays,
        totalRevenueUsd: Math.round(totalPlays * REVENUE_PER_PLAY_USD),
        contentUploadsThisWeek,
        adRevenueUsd: 0,
        adRevenueTrendPct: 0,
      },
      viewer: {
        plays: creatorPlays,
        earningsUsd: Math.round(creatorPlays * REVENUE_PER_PLAY_USD * 100) / 100,
        uploadCount: viewerUploads,
      },
      recentActivity: [],
    };
  }
}
