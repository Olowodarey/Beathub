import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthedRequest } from '../auth/request-user.type';
import { ContentService } from './content.service';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';

type Authed = NonNullable<AuthedRequest['authUser']>;

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContentStatusDto,
    @CurrentUser() authUser: Authed,
  ) {
    return this.content.updateStatus(id, dto, authUser);
  }

  @Post(':id/play')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  recordPlay(@Param('id') id: string) {
    return this.content.recordPlay(id);
  }
}
