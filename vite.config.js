import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Every generated page is a build input (run `npm run pages` first; npm run dev/build do it for you).
const pages = ['index.html', '404.html', 'making/index.html', 'products/index.html'];
for (const d of fs.existsSync('products') ? fs.readdirSync('products') : []) {
  const f = path.join('products', d, 'index.html');
  if (fs.existsSync(f)) pages.push(f);
}

export default defineConfig({
  base: process.env.SITE_BASE || '/claudy2.0/',
  build: {
    outDir: process.env.SITE_BASE ? 'dist-qa' : 'dist',
    assetsInlineLimit: 0,
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p.replace(/\/?index\.html$|\.html$/, '') || 'index', path.resolve(p)])) },
  },
});
