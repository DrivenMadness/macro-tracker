#!/usr/bin/env node
/**
 * Makes white/near-white background transparent in MuscleHeart.png
 * and regenerates 192 and 512 sizes. Run from project root.
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const iconsDir = join(process.cwd(), 'public', 'icons');
const srcPath = join(iconsDir, 'MuscleHeart.png');

// Threshold: pixels with R,G,B all above this become transparent (0–255)
const WHITE_THRESHOLD = 248;

const image = sharp(srcPath);
const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
    data[i + 3] = 0;
  }
}

const transparent = sharp(data, { raw: { width, height, channels } });
await transparent.png().toFile(srcPath);

await sharp(srcPath).resize(192, 192).toFile(join(iconsDir, 'MuscleHeart-192.png'));
await sharp(srcPath).resize(512, 512).toFile(join(iconsDir, 'MuscleHeart-512.png'));

console.log('Done: white background removed and 192/512 icons regenerated.');
