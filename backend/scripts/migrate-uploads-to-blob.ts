/**
 * One-off migration: moves existing on-disk audio (backend/uploads/<contentId>)
 * into Vercel Blob and repoints each Content row's audioUrl at the Blob URL.
 *
 * Run once, after the Blob store exists, from backend/:
 *   pnpm ts-node scripts/migrate-uploads-to-blob.ts
 *
 * Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN in backend/.env.
 * Idempotent-ish: rows already pointing at an https:// (Blob) URL are skipped.
 */

import 'dotenv/config';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { putAudio } from '../src/content/storage';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set in backend/.env');
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN not set in backend/.env');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  const dir = resolve(process.cwd(), 'uploads');
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    console.log(`No uploads directory at ${dir} — nothing to migrate.`);
    await prisma.$disconnect();
    return;
  }

  let migrated = 0;
  let skipped = 0;

  try {
    for (const contentId of files) {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });
      if (!content) {
        console.warn(`   ? no Content row for file ${contentId} — skipping`);
        skipped++;
        continue;
      }
      if (content.audioUrl?.startsWith('http')) {
        skipped++;
        continue;
      }

      const buffer = await fs.readFile(join(dir, contentId));
      const audioUrl = await putAudio(
        contentId,
        buffer,
        content.audioMimeType ?? 'audio/mpeg',
      );
      await prisma.content.update({
        where: { id: contentId },
        data: { audioUrl },
      });
      console.log(`   ✓ ${content.title} → ${audioUrl}`);
      migrated++;
    }
    console.log(`\nDone. Migrated ${migrated}, skipped ${skipped}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
