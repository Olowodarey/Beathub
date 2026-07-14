import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  console.log(
    '[cors] FRONTEND_ORIGIN raw:',
    JSON.stringify(process.env.FRONTEND_ORIGIN),
  );
  console.log('[cors] allowed origins:', allowedOrigins);
  app.enableCors({
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return cb(null, true);
      const clean = origin.replace(/\/$/, '');
      const allowed =
        allowedOrigins.includes(clean) ||
        clean.endsWith('.vercel.app') ||
        clean === 'http://localhost:3000';
      console.log(
        '[cors] request from',
        origin,
        '→',
        allowed ? 'ALLOW' : 'DENY',
      );
      cb(null, allowed);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
