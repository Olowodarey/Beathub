/**
 * Seeds the library with real popular songs from the iTunes Search API.
 *
 * Each iTunes track has a ~30s preview MP3. This script:
 *   1. Looks up the default team
 *   2. Ensures a synthetic User per artist (upserted on a stable email)
 *   3. Downloads each preview into backend/uploads/<contentId>
 *   4. Inserts an APPROVED Content row so the track appears in Library immediately
 *
 * Idempotent: re-runs skip tracks already inserted (by artist + title).
 *
 * Run: `pnpm seed:library` from backend/
 */

import 'dotenv/config';
import { promises as fs } from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parseBuffer } from 'music-metadata';
import { pathForContent, uploadsRoot } from '../src/content/storage';

interface SearchBucket {
  term: string;
  fallbackGenre: string;
  limit: number;
}

const SEARCH_BUCKETS: SearchBucket[] = [
  { term: 'pop hits', fallbackGenre: 'Pop', limit: 6 },
  { term: 'hip hop', fallbackGenre: 'Hip-Hop', limit: 6 },
  { term: 'lofi beats', fallbackGenre: 'Lo-Fi', limit: 6 },
  { term: 'indie rock', fallbackGenre: 'Indie', limit: 6 },
  { term: 'r&b soul', fallbackGenre: 'R&B', limit: 6 },
  { term: 'afrobeats', fallbackGenre: 'Afrobeats', limit: 6 },
  { term: 'electronic dance', fallbackGenre: 'Electronic', limit: 6 },
];

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl?: string;
  primaryGenreName?: string;
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'artist'
  );
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set in backend/.env');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  try {
    const team = await prisma.team.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!team) {
      throw new Error(
        'No team found in the DB. Create one first (e.g. sign in as an owner).',
      );
    }
    console.log(`Seeding into team: ${team.name} (${team.id})\n`);
    await fs.mkdir(uploadsRoot(), { recursive: true });

    let inserted = 0;
    let skipped = 0;

    for (const bucket of SEARCH_BUCKETS) {
      console.log(`→ Searching iTunes for "${bucket.term}"…`);
      let results: ITunesResult[] = [];
      try {
        results = await fetchWithRetry(bucket);
      } catch (err) {
        console.warn(
          `   iTunes search for "${bucket.term}" gave up: ${(err as Error).message}`,
        );
        continue;
      }

      for (const track of results) {
        if (!track.previewUrl) {
          skipped++;
          continue;
        }

        try {
          const status = await seedTrack(prisma, team.id, track, bucket);
          if (status === 'inserted') inserted++;
          else skipped++;
        } catch (err) {
          console.warn(
            `   ✗ "${track.trackName}" — ${(err as Error).message}`,
          );
          skipped++;
        }

        await new Promise((r) => setTimeout(r, 100));
      }
    }

    console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function fetchWithRetry(bucket: SearchBucket): Promise<ITunesResult[]> {
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(bucket.term)}` +
    `&entity=song&limit=${bucket.limit}&country=US`;
  const attempts = 3;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { results: ITunesResult[] };
      return data.results;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function seedTrack(
  prisma: PrismaClient,
  teamId: string,
  track: ITunesResult,
  bucket: SearchBucket,
): Promise<'inserted' | 'skipped'> {
  const artistSlug = slugify(track.artistName);
  const artistEmail = `${artistSlug}@itunes.beathub.local`;

  const artist = await prisma.user.upsert({
    where: { email: artistEmail },
    create: {
      email: artistEmail,
      name: track.artistName,
    },
    update: {},
  });

  const existing = await prisma.content.findFirst({
    where: { teamId, uploaderId: artist.id, title: track.trackName },
  });
  if (existing) return 'skipped';

  const audioRes = await fetch(track.previewUrl!);
  if (!audioRes.ok) throw new Error(`download HTTP ${audioRes.status}`);
  const buffer = Buffer.from(await audioRes.arrayBuffer());

  const meta = await parseBuffer(buffer, 'audio/mpeg').catch(() => null);
  const durationSeconds = Math.max(
    1,
    Math.round(meta?.format.duration ?? 30),
  );

  const created = await prisma.content.create({
    data: {
      teamId,
      uploaderId: artist.id,
      kind: 'TRACK',
      title: track.trackName,
      genre: track.primaryGenreName || bucket.fallbackGenre,
      durationSeconds,
      audioMimeType: 'audio/mpeg',
      fileSizeBytes: buffer.length,
      status: 'APPROVED',
    },
  });

  await fs.writeFile(pathForContent(created.id), buffer);
  await prisma.content.update({
    where: { id: created.id },
    data: { audioUrl: `/content/${created.id}/stream` },
  });

  console.log(`   ✓ ${track.trackName} — ${track.artistName}`);
  return 'inserted';
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
