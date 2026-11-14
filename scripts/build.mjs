import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

const source = new URL('../public/', import.meta.url);
const target = new URL('../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

const index = new URL('index.html', target);
let html = await readFile(index, 'utf8');
for (const file of ['styles.css', 'news-data.js', 'videos.js', 'app.js']) {
  const asset = new URL(file, target);
  const hash = createHash('sha256').update(await readFile(asset)).digest('hex').slice(0, 12);
  const versioned = file.replace(/\.(css|js)$/, `.${hash}.$1`);
  await rename(asset, new URL(versioned, target));
  html = html.replace(`"${file}"`, `"${versioned}"`);
}
await writeFile(index, html);
console.log('Built static site in dist/');
