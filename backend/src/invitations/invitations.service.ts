import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { mapInvitation, mapMembership } from '../common/mappers';
import { CreateInvitationDto } from '../teams/dto/create-invitation.dto';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(teamId: string, status?: InvitationStatus) {
    const invitations = await this.prisma.invitation.findMany({
      where: { teamId, ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
    });
    return invitations.map(mapInvitation);
  }

  async create(
    teamId: string,
    invitedById: string,
    dto: CreateInvitationDto,
  ) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email.toLowerCase(),
        teamId,
        role: dto.role,
        personaType: dto.personaType ?? null,
        token,
        invitedById,
        expiresAt,
      },
    });

    this.logger.log(
      `[invite:stub] to=${dto.email} team=${teamId} url=/invite/${token}`,
    );

    return mapInvitation(invitation);
  }

  async revoke(teamId: string, id: string) {
    const inv = await this.prisma.invitation.findUnique({ where: { id } });
    if (!inv || inv.teamId !== teamId) throw new NotFoundException();
    if (inv.status !== 'PENDING') {
      throw new ConflictException('Invitation is not pending');
    }
    await this.prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }

  async accept(token: string, userId: string) {
    const inv = await this.prisma.invitation.findUnique({ where: { token } });
    if (!inv) throw new NotFoundException('Invitation not found');

    if (inv.status === 'ACCEPTED') {
      throw new ConflictException('Invitation already accepted');
    }
    if (inv.status === 'REVOKED') {
      throw new GoneException('Invitation revoked');
    }
    if (inv.status === 'EXPIRED' || inv.expiresAt < new Date()) {
      if (inv.status !== 'EXPIRED') {
        await this.prisma.invitation.update({
          where: { id: inv.id },
          data: { status: 'EXPIRED' },
        });
      }
      throw new GoneException('Invitation expired');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_teamId: { userId, teamId: inv.teamId } },
    });
    if (existing) {
      throw new ConflictException('Already a member of this team');
    }

    const [membership] = await this.prisma.$transaction([
      this.prisma.membership.create({
        data: {
          userId,
          teamId: inv.teamId,
          role: inv.role,
          personaType: inv.personaType,
        },
      }),
      this.prisma.invitation.update({
        where: { id: inv.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      }),
    ]);

    return mapMembership(membership);
  }
}
