import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(teamId: string) {
    const now = new Date();
    const months: Array<{ month: string; from: Date; to: Date }> = [];
    for (let i = 5; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      months.push({
        month: from.toLocaleString('en-US', { month: 'short' }),
        from,
        to,
      });
    }

    const userGrowthSeries = await Promise.all(
      months.map(async ({ month, from, to }) => {
        const [creators, listeners] = await Promise.all([
          this.prisma.membership.count({
            where: {
              teamId,
              personaType: 'CREATOR',
              createdAt: { gte: from, lt: to },
            },
          }),
          this.prisma.membership.count({
            where: {
              teamId,
              personaType: 'LABEL_REP',
              createdAt: { gte: from, lt: to },
            },
          }),
        ]);
        return { month, creators, listeners };
      }),
    );

    return {
      revenueSeries: [],
      userGrowthSeries,
      platformShare: [],
      regionShare: [],
      subscriptionShare: [],
    };
  }
}
