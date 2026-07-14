import { Injectable } from '@nestjs/common';
import * as os from 'os';

type Intent = 'good' | 'warn' | 'bad';
type Gauge = {
  label: string;
  value: number;
  unit: string;
  intent: Intent;
};

@Injectable()
export class SystemService {
  async getGauges(): Promise<Gauge[]> {
    const uptimeHours = Math.round((process.uptime() / 3600) * 10) / 10;

    const start = performance.now();
    await new Promise<void>((resolve) => setImmediate(resolve));
    const eventLoopLagMs = Math.round((performance.now() - start) * 10) / 10;

    const cores = Math.max(os.cpus().length, 1);
    const cpuPct = Math.min(
      100,
      Math.round((os.loadavg()[0] / cores) * 100),
    );

    const mem = process.memoryUsage();
    const memPct = Math.round((mem.heapUsed / mem.heapTotal) * 100);

    return [
      { label: 'Uptime', value: uptimeHours, unit: 'h', intent: 'good' },
      {
        label: 'Response time',
        value: eventLoopLagMs,
        unit: 'ms',
        intent: thresholdIntent(eventLoopLagMs, { warn: 100, bad: 200 }),
      },
      {
        label: 'CPU usage',
        value: cpuPct,
        unit: '%',
        intent: thresholdIntent(cpuPct, { warn: 60, bad: 80 }),
      },
      {
        label: 'Memory usage',
        value: memPct,
        unit: '%',
        intent: thresholdIntent(memPct, { warn: 70, bad: 85 }),
      },
    ];
  }
}

function thresholdIntent(
  value: number,
  { warn, bad }: { warn: number; bad: number },
): Intent {
  if (value >= bad) return 'bad';
  if (value >= warn) return 'warn';
  return 'good';
}
