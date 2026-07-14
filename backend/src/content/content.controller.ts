import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { ContentService } from './content.service';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('content')
@UseGuards(ClerkAuthGuard)
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContentStatusDto,
    @CurrentUser() authUser: Authed,
  ) {
    return this.content.updateStatus(id, dto, authUser);
  }
}
