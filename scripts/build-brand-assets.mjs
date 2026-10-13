import { readFile, writeFile, stat } from 'node:fs/promises';
import sharp from 'sharp';

// Format conversion only: retain the approved JPG logo and original OGP PNG.
const logo = await readFile(new URL('../public/favicon.jpg', import.meta.url));
for (const size of [96, 192, 180]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `brand-icon-${size}.png`;
  await sharp(logo).resize(size, size).png({compressionLevel: 9}).toFile(new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
}
const sizes = [32, 48, 96];
const pngs = await Promise.all(sizes.map((size) => sharp(logo).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
pngs.forEach((png, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([directory, ...pngs]));
const original = new URL('../public/ogp.png', import.meta.url);
const optimized = new URL('../public/ogp.webp', import.meta.url);
await sharp(await readFile(original)).webp({lossless: true, effort: 6}).toFile(optimized.pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const [before, after] = await Promise.all([sharp(await readFile(original)).raw().toBuffer(), sharp(await readFile(optimized)).raw().toBuffer()]);
if (!before.equals(after)) throw new Error('Lossless OGP conversion changed pixels.');
console.log(JSON.stringify({logoSizes: [96,192,180], icoSizes: sizes, ogpOriginalBytes: (await stat(original)).size, ogpWebpBytes: (await stat(optimized)).size, identicalOgpPixels: true}));
