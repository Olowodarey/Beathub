import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapContent } from '../common/mappers';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    const rows = await this.prisma.playlist.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: true,
        _count: { select: { tracks: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      ownerId: p.ownerId,
      ownerName: p.owner.name ?? p.owner.email,
      role: p.ownerId === userId ? ('owner' as const) : ('member' as const),
      trackCount: p._count.tracks,
      memberCount: p._count.members,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async create(userId: string, name: string) {
    const created = await this.prisma.playlist.create({
      data: { name: name.trim(), ownerId: userId },
    });
    return { id: created.id, name: created.name };
  }

  async getDetail(playlistId: string, userId: string) {
    const playlist = await this.assertAccess(playlistId, userId);
    const [tracks, members, owner] = await Promise.all([
      this.prisma.playlistTrack.findMany({
        where: { playlistId },
        include: { content: { include: { uploader: true } }, addedBy: true },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.playlistMember.findMany({
        where: { playlistId },
        include: { user: true },
        orderBy: { addedAt: 'asc' },
      }),
      this.prisma.user.findUnique({ where: { id: playlist.ownerId } }),
    ]);

    return {
      id: playlist.id,
      name: playlist.name,
      ownerId: playlist.ownerId,
      ownerName: owner?.name ?? owner?.email ?? 'Unknown',
      ownerEmail: owner?.email ?? '',
      viewerRole: (playlist.ownerId === userId ? 'owner' : 'member') as
        | 'owner'
        | 'member',
      createdAt: playlist.createdAt.toISOString(),
      tracks: tracks.map((t) => ({
        entryId: t.id,
        position: t.position,
        addedAt: t.createdAt.toISOString(),
        addedByName: t.addedBy.name ?? t.addedBy.email,
        track: mapContent(t.content),
      })),
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name ?? m.user.email,
        email: m.user.email,
        addedAt: m.addedAt.toISOString(),
      })),
    };
  }

  async rename(playlistId: string, userId: string, name: string) {
    await this.assertOwner(playlistId, userId);
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
  }

  async remove(playlistId: string, userId: string) {
    await this.assertOwner(playlistId, userId);
    await this.prisma.playlist.delete({ where: { id: playlistId } });
  }

  async addTrack(playlistId: string, userId: string, contentId: string) {
    await this.assertAccess(playlistId, userId);
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content || content.status !== 'APPROVED') {
      throw new NotFoundException('Track not available');
    }
    try {
      const max = await this.prisma.playlistTrack.aggregate({
        _max: { position: true },
        where: { playlistId },
      });
      const created = await this.prisma.playlistTrack.create({
        data: {
          playlistId,
          contentId,
          addedById: userId,
          position: (max._max.position ?? 0) + 1,
        },
      });
      return { entryId: created.id };
    } catch (err) {
      if (
        typeof err === 'object' &&
        err &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException('Track already in this playlist');
      }
      throw err;
    }
  }

  async removeTrack(playlistId: string, userId: string, entryId: string) {
    await this.assertAccess(playlistId, userId);
    const entry = await this.prisma.playlistTrack.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.playlistId !== playlistId) {
      throw new NotFoundException('Track not in playlist');
    }
    await this.prisma.playlistTrack.delete({ where: { id: entryId } });
  }

  async inviteByEmail(playlistId: string, ownerId: string, email: string) {
    const playlist = await this.assertOwner(playlistId, ownerId);
    const normalized = email.trim().toLowerCase();
    const invitee = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!invitee) {
      throw new NotFoundException(
        'No Beathub account for that email — ask them to sign up first.',
      );
    }
    if (invitee.id === playlist.ownerId) {
      throw new BadRequestException('You already own this playlist');
    }
    const alreadyMember = await this.prisma.playlistMember.findFirst({
      where: { playlistId, userId: invitee.id },
    });
    if (alreadyMember) {
      throw new ConflictException('That user is already a member');
    }
    const pending = await this.prisma.playlistInvite.findFirst({
      where: { playlistId, inviteeId: invitee.id, status: 'PENDING' },
    });
    if (pending) {
      throw new ConflictException('An invite is already pending for that user');
    }

    const created = await this.prisma.playlistInvite.create({
      data: {
        playlistId,
        invitedById: ownerId,
        inviteeId: invitee.id,
      },
      include: { invitee: true },
    });
    return this.mapInvite(created, playlist.name);
  }

  async listPendingInvitesForPlaylist(playlistId: string, ownerId: string) {
    await this.assertOwner(playlistId, ownerId);
    const rows = await this.prisma.playlistInvite.findMany({
      where: { playlistId, status: 'PENDING' },
      include: { invitee: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.inviteeId,
      name: r.invitee.name ?? r.invitee.email,
      email: r.invitee.email,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async revokeInvite(playlistId: string, ownerId: string, inviteId: string) {
    await this.assertOwner(playlistId, ownerId);
    const invite = await this.prisma.playlistInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.playlistId !== playlistId) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== 'PENDING') {
      throw new ConflictException('Invite already decided');
    }
    await this.prisma.playlistInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED', decidedAt: new Date() },
    });
  }

  async listMyInvites(userId: string) {
    const rows = await this.prisma.playlistInvite.findMany({
      where: { inviteeId: userId, status: 'PENDING' },
      include: {
        invitedBy: true,
        playlist: {
          include: {
            owner: true,
            _count: { select: { tracks: true, members: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      playlistId: r.playlistId,
      playlistName: r.playlist.name,
      ownerName: r.playlist.owner.name ?? r.playlist.owner.email,
      invitedByName: r.invitedBy.name ?? r.invitedBy.email,
      trackCount: r.playlist._count.tracks,
      memberCount: r.playlist._count.members,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async respondToInvite(
    inviteId: string,
    userId: string,
    decision: 'ACCEPTED' | 'DECLINED',
  ) {
    const invite = await this.prisma.playlistInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.inviteeId !== userId) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== 'PENDING') {
      throw new ConflictException('Invite already decided');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.playlistInvite.update({
        where: { id: inviteId },
        data: { status: decision, decidedAt: new Date() },
      });
      if (decision === 'ACCEPTED') {
        await tx.playlistMember.upsert({
          where: {
            playlistId_userId: {
              playlistId: invite.playlistId,
              userId,
            },
          },
          create: { playlistId: invite.playlistId, userId },
          update: {},
        });
      }
    });
    return { playlistId: invite.playlistId };
  }

  async removeMember(
    playlistId: string,
    ownerId: string,
    memberUserId: string,
  ) {
    await this.assertOwner(playlistId, ownerId);
    await this.prisma.playlistMember.deleteMany({
      where: { playlistId, userId: memberUserId },
    });
  }

  private mapInvite(
    invite: {
      id: string;
      inviteeId: string;
      status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
      createdAt: Date;
      invitee: { name: string | null; email: string };
    },
    playlistName: string,
  ) {
    return {
      id: invite.id,
      userId: invite.inviteeId,
      name: invite.invitee.name ?? invite.invitee.email,
      email: invite.invitee.email,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
      playlistName,
    };
  }

  private async assertAccess(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { members: { where: { userId }, select: { id: true } } },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId && playlist.members.length === 0) {
      throw new ForbiddenException('You do not have access to this playlist');
    }
    return playlist;
  }

  private async assertOwner(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can do that');
    }
    return playlist;
  }
}
