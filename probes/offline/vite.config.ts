import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const probeRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(probeRoot, '../..');
const probeBuild = resolve(probeRoot, '../../dist-probe');

function listFiles(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(folder, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function injectPublicShellManifest(): Plugin {
  return {
    name: 'offline-probe-shell-manifest',
    writeBundle() {
      const workerPath = resolve(probeBuild, 'sw.js');
      const workerSource = readFileSync(workerPath, 'utf8');
      const builtAssets = listFiles(resolve(probeBuild, 'assets'))
        .sort((left, right) => left.localeCompare(right));
      const precacheUrls = [
        '/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg',
        '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
        ...builtAssets.map((assetPath) => `/${assetPath.slice(probeBuild.length + 1).replaceAll('\\', '/')}`),
      ];
      const fingerprint = createHash('sha256')
        .update(workerSource)
        .update(precacheUrls.join('\n'))
        .update(builtAssets.map((assetPath) => readFileSync(assetPath)).join('\n'))
        .update(precacheUrls.map((url) => {
          const localPath = resolve(probeBuild, url === '/' ? 'index.html' : url.slice(1));
          return readFileSync(localPath);
        }).join('\n'))
        .digest('hex')
        .slice(0, 12);
      const source = workerSource
        .replaceAll('__CACHE_VERSION__', fingerprint)
        .replaceAll('__PRECACHE_URLS_JSON__', JSON.stringify(precacheUrls));
      if (source.includes('__CACHE_VERSION__') || source.includes('__PRECACHE_URLS_JSON__')) {
        throw new Error('Could not inject the build-specific shell cache manifest.');
      }
      writeFileSync(workerPath, source);
    },
  };
}

export default defineConfig({
  root: probeRoot,
  base: '/',
  publicDir: resolve(probeRoot, 'public'),
  plugins: [injectPublicShellManifest()],
  server: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
    fs: { allow: [workspaceRoot] },
  },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: {
    outDir: probeBuild,
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: resolve(probeRoot, 'index.html'),
      output: { entryFileNames: 'assets/[name]-[hash].js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' },
    },
  },
});
