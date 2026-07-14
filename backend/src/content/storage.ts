import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(process.cwd(), 'uploads');

export function uploadsRoot() {
  if (!existsSync(ROOT)) mkdirSync(ROOT, { recursive: true });
  return ROOT;
}

// Stored as a plain file named by content id. Extension isn't needed on disk;
// the mime type is stored on the Content row and used as Content-Type.
export function pathForContent(contentId: string) {
  return join(uploadsRoot(), contentId);
}
