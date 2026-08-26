import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
const mediaUrls = [...appSource.matchAll(/src:\s*'(https:\/\/[^']+\.mp4)'/g)].map(
  match => match[1]
);

if (mediaUrls.length === 0) {
  throw new Error('No remote demo video sources found');
}

for (const mediaUrl of new Set(mediaUrls)) {
  const response = await fetch(mediaUrl, {
    headers: { Range: 'bytes=0-0' },
    signal: AbortSignal.timeout(15_000),
  });
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok || !contentType.startsWith('video/')) {
    throw new Error(`${mediaUrl} returned ${response.status} ${contentType || 'without a type'}`);
  }

  await response.body?.cancel();
  console.log(`Verified ${mediaUrl} (${response.status} ${contentType})`);
}
