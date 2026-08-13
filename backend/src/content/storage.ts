import { put, del } from '@vercel/blob';

// Audio is stored in Vercel Blob (not on local disk) so it survives on a
// serverless/ephemeral filesystem. Each upload returns a public CDN URL that we
// persist on the Content row; the browser's <audio> element streams straight
// from Blob, which handles HTTP range requests natively.

// Stores the audio buffer and returns its public Blob URL.
export async function putAudio(
  contentId: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const blob = await put(`content/${contentId}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

// Removes a stored audio object by its Blob URL. Safe to ignore if missing.
export async function deleteAudio(url: string): Promise<void> {
  await del(url);
}
