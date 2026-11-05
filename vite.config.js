import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Every generated page is a build input (run `npm run pages` first; npm run dev/build do it for you).
const pages = ['index.html', '404.html', 'about/index.html', 'journey/index.html', 'making/index.html', 'projects/index.html'];
for (const d of fs.existsSync('projects') ? fs.readdirSync('projects') : []) {
  const f = path.join('projects', d, 'index.html');
  if (fs.existsSync(f)) pages.push(f);
}

export default defineConfig({
  base: '/claudy2.0/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p.replace(/\/?index\.html$|\.html$/, '') || 'index', path.resolve(p)])) },
  },
});
