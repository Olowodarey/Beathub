import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs, createReadStream, statSync } from 'fs';
import type { Response } from 'express';
import { parseBuffer } from 'music-metadata';
import { PrismaService } from '../prisma/prisma.service';
import { mapContent } from '../common/mappers';
import { requireTeamRole } from '../common/auth-helpers';
import type { AuthedRequest } from '../auth/request-user.type';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';
import { pathForContent } from './storage';

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

    const targetPath = pathForContent(created.id);
    await fs.writeFile(targetPath, file.buffer);

    const updated = await this.prisma.content.update({
      where: { id: created.id },
      data: { audioUrl: `/content/${created.id}/stream` },
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

  async streamAudio(id: string, range: string | undefined, res: Response) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content || !content.audioMimeType) {
      throw new NotFoundException('audio not available');
    }
    if (content.status !== 'APPROVED') {
      throw new NotFoundException('audio not available');
    }

    const path = pathForContent(id);
    let stats: ReturnType<typeof statSync>;
    try {
      stats = statSync(path);
    } catch {
      throw new NotFoundException('audio file missing on disk');
    }

    const total = stats.size;
    const mime = content.audioMimeType;

    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) {
        res.status(416).setHeader('Content-Range', `bytes */${total}`);
        res.end();
        return;
      }
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : total - 1;
      if (start >= total || end >= total || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${total}`);
        res.end();
        return;
      }
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', String(end - start + 1));
      res.setHeader('Content-Type', mime);
      createReadStream(path, { start, end }).pipe(res);
      return;
    }

    res.status(200);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', String(total));
    res.setHeader('Content-Type', mime);
    createReadStream(path).pipe(res);
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
