import { INestApplication, ValidationPipe } from '@nestjs/common';

// Shared runtime config applied to the Nest app, used by both the local
// standalone server (main.ts) and the Vercel serverless entry (api/index.ts)
// so the two entrypoints stay in sync.
export function configureApp(app: INestApplication) {
  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

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
      cb(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}
