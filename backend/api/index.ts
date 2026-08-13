import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express, type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app-setup';

// Vercel serverless entry. Unlike main.ts we never call app.listen() — Vercel
// owns the HTTP server. We bootstrap Nest onto an Express instance once and
// reuse it across invocations (Fluid Compute keeps instances warm), so the
// bootstrap cost is paid on cold start only.
let serverPromise: Promise<Express> | null = null;

async function bootstrapServer(): Promise<Express> {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  configureApp(app);
  await app.init();
  return server;
}

function getServer(): Promise<Express> {
  if (!serverPromise) serverPromise = bootstrapServer();
  return serverPromise;
}

export default async function handler(req: Request, res: Response) {
  const server = await getServer();
  server(req, res);
}
