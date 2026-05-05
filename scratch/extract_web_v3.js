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
const compressedData = buffer.slice(dataStart);

try {
    const decompressed = zlib.gunzipSync(compressedData);
    console.log('Decompressed whole block. Total uncompressed size:', decompressed.length);
    
    files.forEach(file => {
        const fileContent = decompressed.slice(file.offset, file.offset + file.size);
        fs.writeFileSync(path.join(outputDir, file.filename), fileContent);
        console.log(`Extracted ${file.filename} (${file.size} bytes)`);
    });
} catch (e) {
    console.log(`Failed to decompress block: ${e.message}`);
}
