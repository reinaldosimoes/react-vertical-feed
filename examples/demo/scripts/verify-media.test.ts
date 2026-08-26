// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { extractMediaFiles, inspectMp4, verifyDemoMedia } from './verify-media.mjs';

const box = (type: string, payload = Buffer.alloc(0)): Buffer => {
  const result = Buffer.alloc(8 + payload.byteLength);
  result.writeUInt32BE(result.byteLength, 0);
  result.write(type, 4, 4, 'ascii');
  payload.copy(result, 8);
  return result;
};

const optimizedMp4 = (): Buffer =>
  Buffer.concat([
    box('ftyp', Buffer.from('isom')),
    box('moov', Buffer.from('video sample entry avc1')),
    box('mdat', Buffer.alloc(100_000)),
  ]);

describe('demo media verification', () => {
  it('extracts the three configured local video names', () => {
    const source = [
      "demoVideoPath('clouds.mp4')",
      "demoVideoPath('wind.mp4')",
      "demoVideoPath('grasshopper.mp4')",
    ].join('\n');

    expect(extractMediaFiles(source)).toEqual(['clouds.mp4', 'wind.mp4', 'grasshopper.mp4']);
  });

  it('accepts a fast-start H.264 MP4', () => {
    const result = inspectMp4(optimizedMp4());

    expect(result.moovOffset).toBeLessThan(result.mdatOffset);
    expect(result.boxes.map(({ type }: { type: string }) => type)).toEqual([
      'ftyp',
      'moov',
      'mdat',
    ]);
  });

  it('rejects media with a truncated box', () => {
    const media = Buffer.concat([box('ftyp'), Buffer.from([0, 0, 0, 12, 109, 111, 111, 118])]);

    expect(() => inspectMp4(media)).toThrow(/moov box size is invalid/);
  });

  it('rejects media that cannot start before the full download', () => {
    const media = Buffer.concat([
      box('ftyp'),
      box('mdat', Buffer.alloc(100_000)),
      box('moov', Buffer.from('avc1')),
    ]);

    expect(() => inspectMp4(media)).toThrow(/place moov before mdat/);
  });

  it('rejects a video without an H.264 track', () => {
    const media = Buffer.concat([box('ftyp'), box('moov', Buffer.from('vp09')), box('mdat')]);

    expect(() => inspectMp4(media)).toThrow(/H\.264 avc1/);
  });

  it('rejects duplicate demo sources before reading files', async () => {
    const readMedia = vi.fn(async () => optimizedMp4());
    const appSource = Array.from({ length: 3 }, () => "demoVideoPath('clouds.mp4')").join('\n');

    await expect(verifyDemoMedia({ appSource, readMedia })).rejects.toThrow(
      /three distinct local MP4 files/
    );
    expect(readMedia).not.toHaveBeenCalled();
  });

  it('rejects incomplete video files', async () => {
    const appSource = ['clouds', 'wind', 'grasshopper']
      .map(name => `demoVideoPath('${name}.mp4')`)
      .join('\n');

    await expect(
      verifyDemoMedia({ appSource, readMedia: async () => Buffer.alloc(256) })
    ).rejects.toThrow(/too small to be a complete demo video/);
  });
});
