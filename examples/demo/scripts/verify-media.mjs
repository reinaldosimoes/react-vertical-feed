import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const MINIMUM_MEDIA_BYTES = 100_000;

export const extractMediaFiles = appSource =>
  [...appSource.matchAll(/demoVideoPath\('([^']+\.mp4)'\)/g)].map(match => match[1]);

export const inspectMp4 = media => {
  const boxes = [];
  let offset = 0;

  while (offset < media.byteLength) {
    if (offset + 8 > media.byteLength) {
      throw new Error('The MP4 has a truncated box header');
    }

    let size = media.readUInt32BE(offset);
    const type = media.subarray(offset + 4, offset + 8).toString('ascii');
    let headerSize = 8;

    if (size === 1) {
      if (offset + 16 > media.byteLength) {
        throw new Error(`The ${type} box has a truncated extended size`);
      }
      const extendedSize = media.readBigUInt64BE(offset + 8);
      if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(`The ${type} box is too large to validate safely`);
      }
      size = Number(extendedSize);
      headerSize = 16;
    } else if (size === 0) {
      size = media.byteLength - offset;
    }

    if (size < headerSize || offset + size > media.byteLength) {
      throw new Error(`The ${type} box size is invalid`);
    }

    boxes.push({ type, offset, size });
    offset += size;
  }

  if (boxes[0]?.type !== 'ftyp') {
    throw new Error('The MP4 must start with an ftyp box');
  }

  const moov = boxes.find(box => box.type === 'moov');
  const mdat = boxes.find(box => box.type === 'mdat');
  if (!moov || !mdat) {
    throw new Error('The MP4 must contain moov and mdat boxes');
  }
  if (moov.offset > mdat.offset) {
    throw new Error('The MP4 must place moov before mdat for fast start');
  }
  if (media.indexOf(Buffer.from('avc1')) === -1) {
    throw new Error('The MP4 must contain an H.264 avc1 video track');
  }

  return { boxes, moovOffset: moov.offset, mdatOffset: mdat.offset };
};

export const verifyDemoMedia = async ({ appSource, readMedia }) => {
  const mediaFiles = extractMediaFiles(appSource);
  const uniqueMediaFiles = new Set(mediaFiles);

  if (mediaFiles.length !== 3 || uniqueMediaFiles.size !== 3) {
    throw new Error('The demo must reference three distinct local MP4 files');
  }

  const results = [];
  for (const mediaFile of uniqueMediaFiles) {
    const media = await readMedia(mediaFile);
    if (media.byteLength < MINIMUM_MEDIA_BYTES) {
      throw new Error(`${mediaFile} is too small to be a complete demo video`);
    }
    inspectMp4(media);
    results.push({ mediaFile, byteLength: media.byteLength });
  }

  return results;
};

const run = async () => {
  const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const results = await verifyDemoMedia({
    appSource,
    readMedia: mediaFile => readFile(new URL(`../public/videos/${mediaFile}`, import.meta.url)),
  });

  for (const { mediaFile, byteLength } of results) {
    console.log(`Verified ${mediaFile} (${Math.round(byteLength / 1024)} KiB)`);
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run();
}
