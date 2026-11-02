import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));

function injectPublicShellManifest(): Plugin {
  return {
    name: 'travel-buddy-public-shell-manifest',
    generateBundle(_options, bundle) {
      const worker = bundle['sw.js'];
      if (!worker || worker.type !== 'chunk') {
        throw new Error('Expected the service worker entry at sw.js.');
      }

      const builtAssets = Object.values(bundle)
        .filter((output) => output.fileName.startsWith('assets/'))
        .sort((a, b) => a.fileName.localeCompare(b.fileName));
      const assetPaths = builtAssets.map((asset) => `/${asset.fileName}`);
      const precacheUrls = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icons/icon.svg',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/apple-touch-icon.png',
        ...assetPaths,
      ];
      const buildFingerprint = createHash('sha256')
        .update(worker.code)
        .update(precacheUrls.join('\n'))
        .update(builtAssets.map((asset) => asset.type === 'asset' ? asset.source : asset.code).join('\n'))
        .update(bundle['index.html']?.type === 'asset' ? bundle['index.html'].source : '')
        .update(readFileSync(resolve(projectRoot, 'public/manifest.webmanifest')))
        .update(readFileSync(resolve(projectRoot, 'public/icons/icon.svg')))
        .update(readFileSync(resolve(projectRoot, 'public/icons/icon-192.png')))
        .update(readFileSync(resolve(projectRoot, 'public/icons/icon-512.png')))
        .update(readFileSync(resolve(projectRoot, 'public/icons/apple-touch-icon.png')))
        .digest('hex')
        .slice(0, 12);

      worker.code = worker.code
        .replaceAll(JSON.stringify('__CACHE_VERSION__'), JSON.stringify(buildFingerprint))
        .replaceAll(
          JSON.stringify('__PRECACHE_URLS_JSON__'),
          JSON.stringify(JSON.stringify(precacheUrls)),
        );
      if (worker.code.includes('__CACHE_VERSION__') || worker.code.includes('__PRECACHE_URLS_JSON__')) {
        throw new Error('Failed to inject the build-specific shell cache manifest.');
      }
    },
  };
}

export default defineConfig({
  plugins: [injectPublicShellManifest()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(projectRoot, 'index.html'),
        sw: resolve(projectRoot, 'src/pwa/sw.ts'),
      },
      output: {
        entryFileNames: (chunk) => chunk.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js',
      },
    },
  },
});
