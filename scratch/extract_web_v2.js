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

const dataStart = 2462; // from hex dump observation (0x99e)

files.forEach(file => {
    try {
        const compressedData = buffer.slice(dataStart + file.offset);
        // We don't know the compressed size, but zlib.gunzipSync might stop at the end of the stream.
        // Actually, let's try to decompress the whole buffer from that offset and see if it works for the first file.
        const decompressed = zlib.gunzipSync(compressedData);
        // If it's concatenated GZIPs, we need to find the next header or use the uncompressed size.
        // Let's assume the 'size' in the table is the UNCOMPRESSED size.
        const fileContent = decompressed.slice(0, file.size);
        fs.writeFileSync(path.join(outputDir, file.filename), fileContent);
        console.log(`Extracted ${file.filename} (${file.size} bytes uncompressed)`);
    } catch (e) {
        console.log(`Failed to extract ${file.filename}: ${e.message}`);
    }
});
