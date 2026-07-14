import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapContent } from '../common/mappers';
import { requireTeamRole } from '../common/auth-helpers';
import type { AuthedRequest } from '../auth/request-user.type';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';

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
}
