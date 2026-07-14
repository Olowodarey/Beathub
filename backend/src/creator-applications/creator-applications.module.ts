import { Module } from '@nestjs/common';
import { CreatorApplicationsService } from './creator-applications.service';

@Module({
  providers: [CreatorApplicationsService],
  exports: [CreatorApplicationsService],
})
export class CreatorApplicationsModule {}
