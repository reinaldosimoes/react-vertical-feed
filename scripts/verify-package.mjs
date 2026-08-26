import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let archivePath;
const consumerDirectories = [];

const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

try {
  const [packResult] = JSON.parse(run('npm', ['pack', '--json'], projectRoot));
  archivePath = join(projectRoot, packResult.filename);

  const forbiddenFiles = packResult.files
    .map(file => file.path)
    .filter(file => /(^|\/)(__tests__|setupTests)(\/|\.|$)/.test(file));

  if (forbiddenFiles.length > 0) {
    throw new Error(`Package contains test artifacts: ${forbiddenFiles.join(', ')}`);
  }

  for (const reactVersion of ['17.0.2', '19.2.8']) {
    const consumerDirectory = mkdtempSync(join(tmpdir(), 'react-vertical-feed-pack-'));
    consumerDirectories.push(consumerDirectory);
    writeFileSync(
      join(consumerDirectory, 'package.json'),
      JSON.stringify({ name: 'package-smoke-test', private: true }, null, 2)
    );

    run(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        archivePath,
        `react@${reactVersion}`,
        `react-dom@${reactVersion}`,
      ],
      consumerDirectory
    );

    run(
      'node',
      ['-e', "const pkg = require('react-vertical-feed'); if (!pkg.VerticalFeed) process.exit(1)"],
      consumerDirectory
    );
    run(
      'node',
      [
        '--input-type=module',
        '-e',
        "const pkg = await import('react-vertical-feed'); if (!pkg.VerticalFeed) process.exit(1)",
      ],
      consumerDirectory
    );
  }

  const manifest = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  console.log(
    `Verified ${manifest.name}@${manifest.version}: ${packResult.entryCount} files, CommonJS and ESM with React 17 and 19`
  );
} finally {
  if (archivePath) rmSync(archivePath, { force: true });
  consumerDirectories.forEach(directory => rmSync(directory, { recursive: true, force: true }));
}
