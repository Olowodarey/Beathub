import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RATE_PER_PLAY_USD = 0.004;

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Label application flow ----

  async submitApplication(
    userId: string,
    labelName: string | undefined,
    message: string | undefined,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new BadRequestException('You need a team membership first');
    }
    if (membership.personaType === 'LABEL_REP') {
      throw new ConflictException('You are already a label owner');
    }
    const pending = await this.prisma.labelApplication.findFirst({
      where: { userId, teamId: membership.teamId, status: 'PENDING' },
    });
    if (pending)
      throw new ConflictException('You already have a pending application');

    const created = await this.prisma.labelApplication.create({
      data: {
        userId,
        teamId: membership.teamId,
        labelName: labelName?.trim() || null,
        message: message?.trim() || null,
      },
    });
    return this.mapApplication(created);
  }

  async myApplication(userId: string) {
    const latest = await this.prisma.labelApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return latest ? this.mapApplication(latest) : null;
  }

  async listApplicationsForTeam(teamId: string, status?: ApplicationStatus) {
    const rows = await this.prisma.labelApplication.findMany({
      where: { teamId, ...(status && { status }) },
      include: { user: true, reviewer: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      ...this.mapApplication(row),
      applicantName: row.user.name ?? row.user.email,
      applicantEmail: row.user.email,
      reviewerName: row.reviewer?.name ?? row.reviewer?.email ?? null,
    }));
  }

  async decideApplication(
    teamId: string,
    applicationId: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerNote: string | undefined,
  ) {
    const app = await this.prisma.labelApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.teamId !== teamId) throw new ForbiddenException('Wrong team');
    if (app.status !== 'PENDING')
      throw new ConflictException('Application already decided');

    const decided = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.labelApplication.update({
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
          data: { personaType: 'LABEL_REP' },
        });
      }
      return updated;
    });

    return this.mapApplication(decided);
  }

  // ---- Roster / invite flow (label side) ----

  async inviteArtistByEmail(labelUserId: string, email: string) {
    await this.assertLabelPersona(labelUserId);
    const normalized = email.trim().toLowerCase();
    const artist = await this.prisma.user.findUnique({
      where: { email: normalized },
      include: {
        memberships: { select: { personaType: true } },
      },
    });
    if (!artist) {
      throw new NotFoundException(
        'No Beathub account for that email — ask them to sign up first.',
      );
    }
    if (artist.id === labelUserId) {
      throw new BadRequestException('You cannot invite yourself');
    }
    const isCreator = artist.memberships.some(
      (m) => m.personaType === 'CREATOR',
    );
    if (!isCreator) {
      throw new BadRequestException(
        'That user is not a creator yet — they need to become a creator first.',
      );
    }
    if (artist.signedLabelId) {
      throw new ConflictException(
        artist.signedLabelId === labelUserId
          ? 'They are already signed to your label'
          : 'That artist is already signed to another label',
      );
    }
    const pending = await this.prisma.labelInvite.findFirst({
      where: { labelUserId, artistUserId: artist.id, status: 'PENDING' },
    });
    if (pending) {
      throw new ConflictException('An invite is already pending for that artist');
    }

    const created = await this.prisma.labelInvite.create({
      data: { labelUserId, artistUserId: artist.id },
      include: { artist: true },
    });
    return this.mapOutgoingInvite(created);
  }

  async listMyOutgoingInvites(labelUserId: string) {
    await this.assertLabelPersona(labelUserId);
    const rows = await this.prisma.labelInvite.findMany({
      where: { labelUserId, status: 'PENDING' },
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapOutgoingInvite(r));
  }

  async revokeOutgoingInvite(labelUserId: string, inviteId: string) {
    await this.assertLabelPersona(labelUserId);
    const invite = await this.prisma.labelInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.labelUserId !== labelUserId) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== 'PENDING')
      throw new ConflictException('Invite already decided');
    await this.prisma.labelInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED', decidedAt: new Date() },
    });
  }

  async listRoster(labelUserId: string) {
    await this.assertLabelPersona(labelUserId);
    const artists = await this.prisma.user.findMany({
      where: { signedLabelId: labelUserId },
      include: {
        uploadedContent: {
          where: { status: 'APPROVED' },
          select: { id: true, playCount: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return artists.map((a) => {
      const plays = a.uploadedContent.reduce(
        (sum, c) => sum + c.playCount,
        0,
      );
      return {
        id: a.id,
        name: a.name ?? a.email,
        email: a.email,
        avatarUrl: a.avatarUrl,
        approvedTrackCount: a.uploadedContent.length,
        totalPlays: plays,
        earningsUsd: Math.round(plays * RATE_PER_PLAY_USD * 100) / 100,
      };
    });
  }

  async removeArtistFromRoster(labelUserId: string, artistUserId: string) {
    await this.assertLabelPersona(labelUserId);
    const artist = await this.prisma.user.findUnique({
      where: { id: artistUserId },
    });
    if (!artist || artist.signedLabelId !== labelUserId) {
      throw new NotFoundException('Artist not on your roster');
    }
    await this.prisma.user.update({
      where: { id: artistUserId },
      data: { signedLabelId: null },
    });
  }

  async labelStats(labelUserId: string) {
    await this.assertLabelPersona(labelUserId);
    const [artistCount, playAgg, topTracks] = await Promise.all([
      this.prisma.user.count({ where: { signedLabelId: labelUserId } }),
      this.prisma.content.aggregate({
        _sum: { playCount: true },
        where: {
          status: 'APPROVED',
          uploader: { signedLabelId: labelUserId },
        },
      }),
      this.prisma.content.findMany({
        where: {
          status: 'APPROVED',
          uploader: { signedLabelId: labelUserId },
        },
        include: { uploader: true },
        orderBy: { playCount: 'desc' },
        take: 10,
      }),
    ]);
    const totalPlays = playAgg._sum.playCount ?? 0;
    return {
      artistCount,
      totalPlays,
      earningsUsd: Math.round(totalPlays * RATE_PER_PLAY_USD * 100) / 100,
      topTracks: topTracks.map((t) => ({
        id: t.id,
        title: t.title,
        genre: t.genre,
        playCount: t.playCount,
        artistName: t.uploader.name ?? t.uploader.email,
        earningsUsd:
          Math.round(t.playCount * RATE_PER_PLAY_USD * 100) / 100,
      })),
    };
  }

  // ---- Artist side ----

  async listMyIncomingInvites(artistUserId: string) {
    const rows = await this.prisma.labelInvite.findMany({
      where: { artistUserId, status: 'PENDING' },
      include: { label: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      labelUserId: r.labelUserId,
      labelName: r.label.name ?? r.label.email,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async respondToIncomingInvite(
    inviteId: string,
    artistUserId: string,
    decision: 'ACCEPTED' | 'DECLINED',
  ) {
    const invite = await this.prisma.labelInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.artistUserId !== artistUserId) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== 'PENDING')
      throw new ConflictException('Invite already decided');

    if (decision === 'ACCEPTED') {
      const artist = await this.prisma.user.findUnique({
        where: { id: artistUserId },
      });
      if (artist?.signedLabelId && artist.signedLabelId !== invite.labelUserId) {
        throw new ConflictException(
          'You are already signed to another label. Leave your current label first.',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.labelInvite.update({
        where: { id: inviteId },
        data: { status: decision, decidedAt: new Date() },
      });
      if (decision === 'ACCEPTED') {
        await tx.user.update({
          where: { id: artistUserId },
          data: { signedLabelId: invite.labelUserId },
        });
      }
    });

    return { labelUserId: invite.labelUserId, decision };
  }

  async leaveLabel(artistUserId: string) {
    const artist = await this.prisma.user.findUnique({
      where: { id: artistUserId },
    });
    if (!artist?.signedLabelId) {
      throw new BadRequestException('You are not signed to any label');
    }
    await this.prisma.user.update({
      where: { id: artistUserId },
      data: { signedLabelId: null },
    });
  }

  // ---- Helpers ----

  private async assertLabelPersona(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, personaType: 'LABEL_REP' },
    });
    if (!membership) {
      throw new ForbiddenException(
        'Only approved label owners can do that',
      );
    }
    return membership;
  }

  private mapApplication(app: {
    id: string;
    userId: string;
    teamId: string;
    labelName: string | null;
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
      labelName: app.labelName,
      message: app.message,
      status: app.status,
      reviewerId: app.reviewerId,
      reviewerNote: app.reviewerNote,
      createdAt: app.createdAt.toISOString(),
      decidedAt: app.decidedAt?.toISOString() ?? null,
    };
  }

  private mapOutgoingInvite(invite: {
    id: string;
    artistUserId: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
    createdAt: Date;
    artist: { name: string | null; email: string };
  }) {
    return {
      id: invite.id,
      artistUserId: invite.artistUserId,
      artistName: invite.artist.name ?? invite.artist.email,
      artistEmail: invite.artist.email,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
    };
  }
}
