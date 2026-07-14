import { Module } from '@nestjs/common';
import { CreatorApplicationsModule } from '../creator-applications/creator-applications.module';
import { MeController } from './me.controller';

@Module({
  imports: [CreatorApplicationsModule],
  controllers: [MeController],
})
export class MeModule {}
