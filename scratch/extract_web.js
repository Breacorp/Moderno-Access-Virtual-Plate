const fs = require('fs');
const path = require('path');

const filePath = 'TNG PRO C2P-Ver1.9-0328-2017.web';
const buffer = fs.readFileSync(filePath);
const outputDir = 'firmware_web';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Search for the start of the HTML file list
// In the hex dump, "index.htm" was at 0x5c (relative to start?)
// Let's find "index.htm" in the buffer.
const indexOffset = buffer.indexOf('index.htm');
console.log('Index.htm found at:', indexOffset);

// Each entry is 32 bytes.
// Filename (16), Size (4), Offset (4), unknown (8)
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

console.log(`Found ${files.length} files in archive.`);

// Now we need to find where the data starts.
// Usually data starts after the file table. 
// Let's assume the offsets are relative to the end of the header or a specific marker.
// From previous observation: index.htm has offset 0, status.htm has offset 762.
// The total size of the header table is files.length * 32.
// Let's find a marker like "<html>" or similar to find the start of data.
const dataStart = buffer.indexOf('<html', 0, 'ascii');
console.log('Data start marker found at:', dataStart);

files.forEach(file => {
    const fileData = buffer.slice(dataStart + file.offset, dataStart + file.offset + file.size);
    fs.writeFileSync(path.join(outputDir, file.filename), fileData);
    console.log(`Extracted ${file.filename} (${file.size} bytes)`);
});
