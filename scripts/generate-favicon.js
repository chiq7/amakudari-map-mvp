const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const size = 96;
const pixels = Buffer.alloc(size * size * 4);
const navy = [6, 33, 63, 255];
const teal = [101, 184, 207, 255];
const gold = [201, 154, 53, 255];

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const offset = (y * size + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function roundedBackground() {
  const radius = 22;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nearX = x < radius ? radius - x : x >= size - radius ? x - (size - radius - 1) : 0;
      const nearY = y < radius ? radius - y : y >= size - radius ? y - (size - radius - 1) : 0;
      if (nearX === 0 || nearY === 0 || nearX * nearX + nearY * nearY <= radius * radius) {
        setPixel(x, y, navy);
      }
    }
  }
}

function line(x0, y0, x1, y1, color, width = 5) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(x0 + ((x1 - x0) * step) / steps);
    const y = Math.round(y0 + ((y1 - y0) * step) / steps);
    for (let dy = -width; dy <= width; dy += 1) {
      for (let dx = -width; dx <= width; dx += 1) {
        if (dx * dx + dy * dy <= width * width) setPixel(x + dx, y + dy, color);
      }
    }
  }
}

function circle(cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) setPixel(x, y, color);
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

roundedBackground();
line(18, 66, 40, 42, teal);
line(40, 42, 56, 54, teal);
line(56, 54, 78, 26, teal);
circle(18, 66, 8, gold);
circle(40, 42, 8, teal);
circle(56, 54, 8, teal);
circle(78, 26, 8, gold);

const rows = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y += 1) {
  const target = y * (size * 4 + 1);
  rows[target] = 0;
  pixels.copy(rows, target + 1, y * size * 4, (y + 1) * size * 4);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header[8] = 8;
header[9] = 6;

const output = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", zlib.deflateSync(rows)),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.writeFileSync(path.join(__dirname, "..", "public", "favicon-96.png"), output);
