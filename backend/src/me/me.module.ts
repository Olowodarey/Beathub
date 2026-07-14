import { Module } from '@nestjs/common';
import { CreatorApplicationsModule } from '../creator-applications/creator-applications.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { MeController } from './me.controller';

@Module({
  imports: [CreatorApplicationsModule, PlaylistsModule],
  controllers: [MeController],
})
export class MeModule {}
