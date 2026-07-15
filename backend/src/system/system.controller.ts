import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemService } from './system.service';

@Controller('system')
@UseGuards(JwtAuthGuard)
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get('health')
  async getHealth() {
    return { gauges: await this.system.getGauges() };
  }
}
