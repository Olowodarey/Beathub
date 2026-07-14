import { Module } from '@nestjs/common';
import { CreatorApplicationsModule } from '../creator-applications/creator-applications.module';
import { LabelsModule } from '../labels/labels.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { MeController } from './me.controller';

@Module({
  imports: [CreatorApplicationsModule, PlaylistsModule, LabelsModule],
  controllers: [MeController],
})
export class MeModule {}
