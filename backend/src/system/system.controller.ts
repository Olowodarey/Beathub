import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { SystemService } from './system.service';

@Controller('system')
@UseGuards(ClerkAuthGuard)
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get('health')
  async getHealth() {
    return { gauges: await this.system.getGauges() };
  }
}
