import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../public/', import.meta.url);
const context = { window: {} };
for (const file of ['news-data.js', 'videos.js']) vm.runInNewContext(await readFile(new URL(file, root), 'utf8'), context);
const paths = new Set(['assets/brand-logo.png', 'assets/brand-light.png']);
for (const story of context.window.NEWS) paths.add(story.image);
for (const video of context.window.VIDEOS) { paths.add(video.image); paths.add(video.url); }
for (const file of ['index.html', 'styles.css']) {
  const source = await readFile(new URL(file, root), 'utf8');
  for (const m of source.matchAll(/(?:src|href)="([^"#]+)"|url\(['"]?([^'"\)]+)['"]?\)/g)) {
    const path = m[1] || m[2];
    if (!/^(https?:|data:)/.test(path)) paths.add(path);
  }
}
for (const path of paths) await access(new URL(path, root));
const ids = context.window.NEWS.map(item => item.id);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate news IDs');
console.log(`Checked ${ids.length} stories, ${context.window.VIDEOS.length} videos and ${paths.size} local references.`);
