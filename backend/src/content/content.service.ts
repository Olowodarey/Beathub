import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseBuffer } from 'music-metadata';
import { PrismaService } from '../prisma/prisma.service';
import { mapContent } from '../common/mappers';
import { requireTeamRole } from '../common/auth-helpers';
import type { AuthedRequest } from '../auth/request-user.type';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';
import { putAudio } from './storage';

const AUDIO_MIME_ALLOWLIST = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
]);

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(
    id: string,
    dto: UpdateContentStatusDto,
    authUser: NonNullable<AuthedRequest['authUser']>,
  ) {
    const existing = await this.prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Content not found');

    requireTeamRole(authUser, existing.teamId, ['OWNER', 'ADMIN']);

    const updated = await this.prisma.content.update({
      where: { id },
      data: { status: dto.status },
      include: { uploader: true },
    });
    return mapContent(updated);
  }

  async uploadForTeam(
    teamId: string,
    uploaderId: string,
    dto: CreateContentDto,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('audio file is required');
    if (!AUDIO_MIME_ALLOWLIST.has(file.mimetype)) {
      throw new BadRequestException(`unsupported audio type: ${file.mimetype}`);
    }

    const meta = await parseBuffer(file.buffer, file.mimetype).catch(() => null);
    const durationSeconds = Math.max(1, Math.round(meta?.format.duration ?? 0));

    const created = await this.prisma.content.create({
      data: {
        teamId,
        uploaderId,
        kind: dto.kind ?? 'TRACK',
        title: dto.title,
        genre: dto.genre,
        durationSeconds,
        audioMimeType: file.mimetype,
        fileSizeBytes: file.size,
      },
      include: { uploader: true },
    });

    const audioUrl = await putAudio(created.id, file.buffer, file.mimetype);

    const updated = await this.prisma.content.update({
      where: { id: created.id },
      data: { audioUrl },
      include: { uploader: true },
    });

    return mapContent(updated);
  }

  async listLibrary(teamId: string) {
    const items = await this.prisma.content.findMany({
      where: { teamId, status: 'APPROVED', audioUrl: { not: null } },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(mapContent);
  }

  async recordPlay(id: string) {
    const existing = await this.prisma.content.findUnique({ where: { id } });
    if (!existing || existing.status !== 'APPROVED') {
      throw new NotFoundException('Content not playable');
    }
    const updated = await this.prisma.content.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      include: { uploader: true },
    });
    return mapContent(updated);
  }
}
