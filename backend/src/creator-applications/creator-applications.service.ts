import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreatorApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, message: string | undefined) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new BadRequestException('You need a team membership first');
    }
    if (membership.personaType === 'CREATOR') {
      throw new ConflictException('You are already a creator');
    }
    const pending = await this.prisma.creatorApplication.findFirst({
      where: { userId, teamId: membership.teamId, status: 'PENDING' },
    });
    if (pending) throw new ConflictException('You already have a pending application');

    const created = await this.prisma.creatorApplication.create({
      data: {
        userId,
        teamId: membership.teamId,
        message: message?.trim() || null,
      },
    });
    return this.map(created);
  }

  async mine(userId: string) {
    const latest = await this.prisma.creatorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return latest ? this.map(latest) : null;
  }

  async listForTeam(teamId: string, status?: ApplicationStatus) {
    const items = await this.prisma.creatorApplication.findMany({
      where: { teamId, ...(status && { status }) },
      include: { user: true, reviewer: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((row) => ({
      ...this.map(row),
      applicantName: row.user.name ?? row.user.email,
      applicantEmail: row.user.email,
      reviewerName: row.reviewer?.name ?? row.reviewer?.email ?? null,
    }));
  }

  async decide(
    teamId: string,
    applicationId: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerNote: string | undefined,
  ) {
    const app = await this.prisma.creatorApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.teamId !== teamId) throw new ForbiddenException('Wrong team');
    if (app.status !== 'PENDING') {
      throw new ConflictException('Application already decided');
    }

    const decided = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.creatorApplication.update({
        where: { id: applicationId },
        data: {
          status,
          reviewerId,
          reviewerNote: reviewerNote?.trim() || null,
          decidedAt: new Date(),
        },
      });
      if (status === 'APPROVED') {
        await tx.membership.updateMany({
          where: { userId: app.userId, teamId: app.teamId },
          data: { personaType: 'CREATOR' },
        });
      }
      return updated;
    });

    return this.map(decided);
  }

  private map(app: {
    id: string;
    userId: string;
    teamId: string;
    message: string | null;
    status: ApplicationStatus;
    reviewerId: string | null;
    reviewerNote: string | null;
    createdAt: Date;
    decidedAt: Date | null;
  }) {
    return {
      id: app.id,
      userId: app.userId,
      teamId: app.teamId,
      message: app.message,
      status: app.status,
      reviewerId: app.reviewerId,
      reviewerNote: app.reviewerNote,
      createdAt: app.createdAt.toISOString(),
      decidedAt: app.decidedAt?.toISOString() ?? null,
    };
  }
}
