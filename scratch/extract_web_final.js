const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const filePath = 'TNG PRO C2P-Ver1.9-0328-2017.web';
const buffer = fs.readFileSync(filePath);
const outputDir = 'firmware_web_extracted';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const indexOffset = buffer.indexOf('index.htm');
let currentPos = indexOffset;
const files = [];

while (currentPos < buffer.length) {
    const filename = buffer.slice(currentPos, currentPos + 16).toString().replace(/\0/g, '');
    if (!filename || filename.length === 0 || !filename.includes('.')) break;

    const size = buffer.readUInt32LE(currentPos + 16);
    const offset = buffer.readUInt32LE(currentPos + 20);
    
    files.push({ filename, size, offset });
    currentPos += 32;
}

const dataStart = 2462;

for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const nextOffset = (i < files.length - 1) ? files[i + 1].offset : (buffer.length - dataStart);
    
    try {
        const compressedData = buffer.slice(dataStart + file.offset, dataStart + nextOffset);
        const decompressed = zlib.gunzipSync(compressedData);
        fs.writeFileSync(path.join(outputDir, file.filename), decompressed);
        console.log(`Extracted ${file.filename} (${decompressed.length} bytes)`);
    } catch (e) {
        console.log(`Failed to extract ${file.filename}: ${e.message}`);
    }
}
