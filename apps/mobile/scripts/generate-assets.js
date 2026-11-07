const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isSplash = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 2; // RGB color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLength;
    rawData[rowStart] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;

      if (distSq < radius * radius) {
        // Gold emblem #C5A059 (197, 160, 89)
        rawData[idx] = 197;
        rawData[idx + 1] = 160;
        rawData[idx + 2] = 89;
      } else {
        // Dark forest green background #0D3B2E (13, 59, 46)
        rawData[idx] = 13;
        rawData[idx + 1] = 59;
        rawData[idx + 2] = 46;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Generating mobile assets...');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPng(1024, 1024));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPng(1024, 1024));
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPng(1242, 2436, true));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createPng(48, 48));

console.log('Successfully generated:');
console.log(' - assets/icon.png (1024x1024)');
console.log(' - assets/adaptive-icon.png (1024x1024)');
console.log(' - assets/splash.png (1242x2436)');
console.log(' - assets/favicon.png (48x48)');
